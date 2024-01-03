from pydantic import BaseModel, Field
from pydantic.networks import EmailStr


class UserCreate(BaseModel):
    email: str
    password: str


class UserVerify(BaseModel):
    verification_code: str


class UserResetPassword(BaseModel):
    email: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
