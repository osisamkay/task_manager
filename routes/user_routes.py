# In user_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database_session import SessionLocal
from models.user import User
from services.user_service import UserService
from utils.auth import create_access_token

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Depends(get_db)


@router.post("/register")
def register_user(user: User, db: Session = Depends(get_db)):
    return UserService.create_user(db, user)


@router.post("/login")
def login_user(username: str, password: str, ):
    user = UserService.authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
