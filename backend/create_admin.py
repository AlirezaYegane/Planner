"""
Create admin test user for manual testing.

Usage:
    python create_admin.py

This script creates an admin user with the following credentials:
    Email: admin@planner.app
    Password: admin123
"""

import sys
import os
import traceback

# Add the current directory to sys.path to ensure imports work
sys.path.append(os.getcwd())

try:
    from app.core.database import SessionLocal, engine, Base
    from app.core.security import get_password_hash
    
    # Import ALL models to ensure relationships are registered
    from app.models.user import User
    from app.models.task import Task
    from app.models.board import Board
    from app.models.plan import Plan
    from app.models.team import TeamMember
    from app.models.subscription import Subscription
    from app.models.audit import AuditLog
    
except ImportError as e:
    print("Import Error:", e)
    print("Current path:", os.getcwd())
    print("Sys path:", sys.path)
    traceback.print_exc()
    sys.exit(1)

def create_admin_user():
    """Create or update admin test user."""
    
    print("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print("Error creating tables:", e)
        traceback.print_exc()
        return False
    
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_email = "admin@planner.app"
        existing_user = db.query(User).filter(User.email == admin_email).first()
        
        if existing_user:
            print(f"Admin user already exists: {admin_email}")
            print(f"Updating password to: admin123")
            
            # Update password
            existing_user.hashed_password = get_password_hash("admin123")
            existing_user.is_superuser = True
            existing_user.is_active = True
            db.commit()
            
        else:
            print(f"Creating new admin user: {admin_email}")
            
            # Create new admin user
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                is_active=True,
                is_superuser=True
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            print(f"Admin user created successfully!")
        
        print("\n" + "="*60)
        print("ADMIN TEST USER CREDENTIALS")
        print("="*60)
        print(f"Email:    admin@planner.app")
        print(f"Password: admin123")
        print("="*60)
        print("\nYou can now login at: http://localhost:3000/login")
        print("\nIMPORTANT: Change this password in production!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
        traceback.print_exc()
        db.rollback()
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    success = create_admin_user()
    sys.exit(0 if success else 1)
