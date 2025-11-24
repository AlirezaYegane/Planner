from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Any
import stripe
import os
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_active_user
from app.models.user import User
from app.models.subscription import Subscription

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/create-checkout-session")
async def create_checkout_session(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a Stripe Checkout Session for subscription.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        # Get or create Stripe Customer
        customer_id = None
        if current_user.subscription and current_user.subscription.stripe_customer_id:
            customer_id = current_user.subscription.stripe_customer_id
        else:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": str(current_user.id)}
            )
            customer_id = customer.id
            
            # Create subscription record if not exists
            if not current_user.subscription:
                sub = Subscription(user_id=current_user.id, stripe_customer_id=customer_id)
                db.add(sub)
                db.commit()
            else:
                current_user.subscription.stripe_customer_id = customer_id
                db.commit()

        # Define price IDs (replace with your actual Stripe Price IDs)
        price_id = "price_H5ggYJDqQJ" if plan_id == "pro" else "price_free"
        
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{os.getenv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')}/dashboard/billing?success=true",
            cancel_url=f"{os.getenv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')}/dashboard/billing?canceled=true",
        )

        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhooks to update subscription status.
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Fulfill the purchase...
        handle_checkout_session(session, db)
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription, db)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_deleted(subscription, db)

    return {"status": "success"}

def handle_checkout_session(session, db: Session):
    # Implementation to update user subscription after successful checkout
    pass

def handle_subscription_updated(subscription, db: Session):
    # Implementation to update subscription status/period
    pass

def handle_subscription_deleted(subscription, db: Session):
    # Implementation to mark subscription as canceled
    pass
