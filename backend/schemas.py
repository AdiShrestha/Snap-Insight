from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class QueryCreate(BaseModel):
    query_text: Optional[str] = None
    module_used: Optional[str] = None

class QueryResponse(BaseModel):
    id: int
    user_id: Optional[int]
    query_text: Optional[str]
    response_text: str
    module_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
