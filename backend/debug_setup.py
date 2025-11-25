import sys
import os
import asyncio

# Add current directory to path
sys.path.append(os.getcwd())

async def main():
    print("1. Testing imports...")
    try:
        from app.core.database import SessionLocal
        from app.core.security import get_password_hash, create_verification_token
        from app.models.user import User, AuthProvider
        from app.core.config import settings
        from app.core.email import send_verification_email
        print("   Imports successful")
    except Exception as e:
        print(f"   Import failed: {e}")
        sys.exit(1)

    print("\n2. Testing Password Hashing...")
    try:
        pwd = "password123"
        hashed = get_password_hash(pwd)
        print(f"   Hashing successful: {hashed[:10]}...")
    except Exception as e:
        print(f"   Hashing failed: {e}")
        sys.exit(1)

    print("\n3. Testing Database Connection...")
    try:
        db = SessionLocal()
        print("   Database connection successful")
    except Exception as e:
        print(f"   Database connection failed: {e}")
        sys.exit(1)

    print("\n4. Testing User Creation (Rollback)...")
    try:
        email = "debug_test@example.com"
        # Check if exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("   User already exists, deleting...")
            db.delete(existing)
            db.commit()

        new_user = User(
            email=email,
            username="debug_user",
            hashed_password=hashed,
            full_name="Debug User",
            is_active=True,
            provider=AuthProvider.LOCAL,
            email_verified=False,
            email_verification_token=create_verification_token()
        )
        db.add(new_user)
        db.flush() # Check for integrity errors
        print("   User creation successful (flushed)")
        
        # Don't rollback yet, we might want to test email with this user object if needed, 
        # but for now we just want to see if DB write works.
        db.rollback()
        print("   Rollback successful")
    except Exception as e:
        print(f"   User creation failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

    print("\n5. Testing Email Configuration...")
    print(f"   Provider: {settings.EMAIL_PROVIDER}")
    print(f"   From: {settings.EMAIL_FROM}")
    
    # Optional: Try to render the email template
    print("\n6. Testing Email Template Rendering...")
    try:
        from app.core.email import get_verification_email_html
        html = get_verification_email_html("http://example.com/verify?token=123", "Test User")
        print("   Template rendering successful")
    except Exception as e:
        print(f"   Template rendering failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
