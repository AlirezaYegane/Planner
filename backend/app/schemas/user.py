from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- User Schemas ---

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str
    username: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    """Schema for user response (without password)."""
    id: int
    username: Optional[str] = None
    is_active: bool
    is_superuser: bool
    email_verified: bool
    provider: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# --- Token Schemas ---

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[int] = None


# --- Email Verification Schemas ---

class EmailVerifyRequest(BaseModel):
    """Schema for email verification request."""
    token: str


class ResendVerificationRequest(BaseModel):
    """Schema for resending verification email."""
    email: EmailStr


# --- Password Reset Schemas ---

class PasswordResetRequest(BaseModel):
    """Schema for requesting password reset."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset."""
    token: str
    new_password: str


# --- OAuth Schemas ---

class OAuthUserCreate(BaseModel):
    """Schema for creating user from OAuth provider."""
    email: EmailStr
    full_name: Optional[str] = None
    provider: str
    oauth_id: str

