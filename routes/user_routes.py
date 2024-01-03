# In user_routes.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database_session import UserSessionLocal
from models.user import Token, UserCreate, UserLogin, UserResetPassword, UserVerify
from services.user_service import UserService
from utils.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, oauth2_scheme

router = APIRouter()


def get_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Depends(get_db)


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return UserService(db).create_user(user)


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    return UserService(db).login(user)


@router.post("/verify-email", response_model=Token)
def verify_email(verification_data: UserVerify, db: Session = Depends(get_db)):
    return UserService.verify_email(verification_data, db)


@router.post("/reset-password", response_model=Token)
def reset_password(reset_data: UserResetPassword, db: Session = Depends(get_db)):
    return UserService.reset_password(reset_data, db)
