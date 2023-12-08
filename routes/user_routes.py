# In user_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database_session import UserSessionLocal
from models.user import User, CreateUser
from services.user_service import UserService
from utils.auth import create_access_token, oauth2_scheme, get_current_user

router = APIRouter()


def get_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Depends(get_db)


@router.post("/register")
def register_user(user: CreateUser, db: Session = Depends(get_db)):
    return UserService(db).create_user(user)


@router.post("/login")
async def login_for_access_token(
        user: User,
        db: Session = Depends(get_db),
):
    # Verify the username and password
    user = UserService(db).authenticate_user(user)

    if user:
        # Create an access token
        access_token = create_access_token({"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

    # If authentication fails, raise an HTTPException
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = UserService(db).get_all_users()
    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not Found")
    return users
