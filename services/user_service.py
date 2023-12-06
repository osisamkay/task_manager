from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from database.models.user_table_model import User
from passlib.context import CryptContext


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, username: str, password: str):
        hashed_password = self.hash_password(password)
        new_user = User(username=username, password=hashed_password)

        try:
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            return new_user
        except IntegrityError as e:
            # Handle the case where the username is not unique
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            ) from e
        except Exception as e:
            # Handle other registration errors
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error registering user",
            ) from e

    def hash_password(self, password):
        # Implement your password hashing logic here
        # Example: You can use passlib or another library for password hashing
        pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        return pwd_context.hash(password)

    def authenticate_user(self, username: str, password: str):
        user = self.db.query(User).filter(User.username == username).first()

        if user and self.verify_password(password, user.password):
            return user

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    def verify_password_with_passlib(self, plain_password, hashed_password):
        pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)

    def verify_password(self, plain_password, hashed_password, use_passlib=False):
        if use_passlib:
            return self.verify_password_with_passlib(plain_password, hashed_password)
        else:
            # Implement your custom password hashing and verification logic here
            # Example: You may use a different library or your own method
            pass

    def get_user_by_username(self, username: str):
        user = self.db.query(User).filter(User.username == username).first()

        if user:
            return user
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )