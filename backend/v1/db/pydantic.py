from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, List


# Base User Model
class UserBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    preferences: Optional[Dict] = {}


# Read User Model (Response)
class UserRead(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    oauth_accounts: List["OAuthAccountRead"] = []

    class Config:
        from_attributes = True


# Create User Model (Request)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


# Update User Model (Request)
class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    preferences: Optional[Dict] = None


# Authentication Response Model
class UserAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# OAuth Account Model
class OAuthAccountBase(BaseModel):
    provider: str
    provider_id: str
    extra: Optional[Dict] = {}


class OAuthAccountRead(OAuthAccountBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


class OAuthAccountCreate(OAuthAccountBase):
    user_id: UUID
