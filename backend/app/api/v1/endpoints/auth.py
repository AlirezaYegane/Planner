"""
Enhanced authentication endpoints with email verification, password reset, and OAuth support.
"""

from datetime import timedelta, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_verification_token,
    create_reset_token,
)
from app.core.config import settings
from app.core.email import send_verification_email, send_password_reset_email
from app.models.user import User, AuthProvider
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    EmailVerifyRequest,
    ResendVerificationRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.api.deps import get_current_user

router = APIRouter()

# OAuth setup
oauth = OAuth()

if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'},
    )

if settings.APPLE_CLIENT_ID:
    # Apple OAuth configuration would go here
    # More complex setup required for Apple
    pass


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account with email verification.
    
    - **email**: Valid email address (unique)
    - **password**: User password (will be hashed, min 6 characters)
    - **username**: Optional unique username
    - **full_name**: Optional full name
    
    Sends verification email after successful registration.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered"
        )
    
    # Check if username already exists (if provided)
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken"
            )
    
    # Validate password strength
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Create verification token
    verification_token = create_verification_token()
    token_expiry = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=False,
        provider=AuthProvider.LOCAL,
        email_verified=False,
        email_verification_token=verification_token,
        verification_token_expiry=token_expiry,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email (async, don't wait)
    try:
        await send_verification_email(new_user.email, verification_token, new_user.full_name)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Failed to send verification email: {e}")
    
    return new_user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Login with email/username and password to get JWT access token.
    
    OAuth2 compatible endpoint (uses form data).
    - **username**: Email address or username
    - **password**: User password
    
    Returns JWT access token for authentication.
    """
    # Try to find user by email or username
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated"
        )
    
    # Note: We allow login even if email not verified, but you could enforce it here
    # if not user.email_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Please verify your email address before logging in"
    #     )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/json", response_model=Token)
def login_json(user_data: dict, db: Session = Depends(get_db)):
    """
    Alternative login endpoint that accepts JSON instead of form data.
    
    - **email**: User email or username
    - **password**: User password
    """
    email_or_username = user_data.get("email")
    password = user_data.get("password")
    
    if not email_or_username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username and password required"
        )
    
    user = db.query(User).filter(
        (User.email == email_or_username) | (User.username == email_or_username)
    ).first()
    
    if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user profile.
    
    Requires valid JWT token in Authorization header.
    Returns the user's profile information.
    """
    return current_user


@router.post("/verify-email", response_model=dict)
def verify_email(request: EmailVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify user's email address using token from email.
    
    - **token**: Verification token from email
    """
    user = db.query(User).filter(
        User.email_verification_token == request.token
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Check if token expired
    if user.verification_token_expiry and user.verification_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link has expired. Please request a new one"
        )
    
    # Verify email
    user.email_verified = True
    user.email_verification_token = None
    user.verification_token_expiry = None
    
    db.commit()
    
    return {"message": "Email verified successfully! You can now log in."}


@router.post("/resend-verification", response_model=dict)
async def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    """
    Resend verification email to user.
    
    - **email**: User's email address
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If that email is registered, a verification email has been sent"}
    
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Create new verification token
    verification_token = create_verification_token()
    token_expiry = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    
    user.email_verification_token = verification_token
    user.verification_token_expiry = token_expiry
    
    db.commit()
    
    # Send verification email
    try:
        await send_verification_email(user.email, verification_token, user.full_name)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
    return {"message": "If that email is registered, a verification email has been sent"}


@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request password reset email.
    
    - **email**: User's email address
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    # Don't reveal if email exists
    if not user:
        return {"message": "If that email is registered, a password reset link has been sent"}
    
    # Don't allow password reset for OAuth users
    if user.provider != AuthProvider.LOCAL:
        return {"message": "If that email is registered, a password reset link has been sent"}
    
    # Create reset token
    reset_token = create_reset_token()
    token_expiry = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_EXPIRE_HOURS)
    
    user.reset_token = reset_token
    user.reset_token_expiry = token_expiry
    
    db.commit()
    
    # Send password reset email
    try:
        await send_password_reset_email(user.email, reset_token, user.full_name)
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
    
    return {"message": "If that email is registered, a password reset link has been sent"}


@router.post("/reset-password", response_model=dict)
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    Reset password using token from email.
    
    - **token**: Reset token from email
    - **new_password**: New password (min 6 characters)
    """
    user = db.query(User).filter(User.reset_token == request.token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token expired
    if user.reset_token_expiry and user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link has expired. Please request a new one"
        )
    
    # Validate new password
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    
    db.commit()
    
    return {"message": "Password reset successfully! You can now log in with your new password."}


# OAuth endpoints

@router.get("/google")
async def google_login(request: Request):
    """
    Initiate Google OAuth flow.
    Redirects to Google login page.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured"
        )
    
    redirect_uri = f"{settings.FRONTEND_URL}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback.
    Creates or logs in user and returns JWT token.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured"
        )
    
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )
        
        email = user_info.get('email')
        oauth_id = user_info.get('sub')
        full_name = user_info.get('name')
        
        # Find or create user
        user = db.query(User).filter(
            (User.email == email) | 
            ((User.provider == AuthProvider.GOOGLE) & (User.oauth_id == oauth_id))
        ).first()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                full_name=full_name,
                provider=AuthProvider.GOOGLE,
                oauth_id=oauth_id,
                email_verified=True,  # OAuth emails are verified
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update OAuth info if needed
            if user.provider != AuthProvider.GOOGLE:
                user.provider = AuthProvider.GOOGLE
                user.oauth_id = oauth_id
            user.email_verified = True
            db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/oauth-success?token={access_token}"
        )
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_failed"
        )


@router.get("/apple")
async def apple_login(request: Request):
    """
    Initiate Apple ID OAuth flow.
    Redirects to Apple login page.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth requires additional configuration. Please see documentation."
    )


@router.get("/apple/callback")
async def apple_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle Apple ID OAuth callback.
    Creates or logs in user and returns JWT token.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth requires additional configuration. Please see documentation."
    )
