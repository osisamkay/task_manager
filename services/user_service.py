from datetime import timedelta
import secrets
from sqlite3 import IntegrityError
from fastapi import HTTPException, status
from fastapi_mail import FastMail, MessageSchema
from passlib.context import CryptContext
from models.user import UserLogin, UserResetPassword, UserVerify, UserCreate
from sqlalchemy.orm import Session
from utils.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token
from database.models.user_table_model import User
from utils.email import config_email
from fastapi.responses import JSONResponse


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_create: UserCreate):
        # Check if email already exists
        existing_user = self.db.query(User).filter(
            User.email == user_create.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        verification_code = secrets.token_urlsafe(16)
        hashed_password = self.hash_password(user_create.password)

        db_user = User(
            email=user_create.email,
            hashed_password=hashed_password,
            verification_code=verification_code
        )

        try:
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
        except IntegrityError as e:
            # Handle database integrity errors (e.g., unique constraint violations)
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            ) from e
        except DBAPIError as e:
            # Handle other database-related errors
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user",
            ) from e
        except Exception as e:
            # Handle other registration errors
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user",
            ) from e

        self.send_verification_email(user_create.email, verification_code)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_create.email}, expires_delta=access_token_expires
        )
        return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})

    # def login(self, user_login: UserLogin):
    #     user_login_password = self.hash_password(user_login.password)

    #     db_user = self.db.query(User).filter(
    #         User.email == user_login.email).first()
    #     print(user_login_password, db_user.hashed_password)

    #     if not db_user or db_user.hashed_password != user_login_password:
    #         raise HTTPException(
    #             status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    #     if not db_user.is_active:
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST, detail="User not verified")

    #     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    #     access_token = create_access_token(
    #         data={"sub": user_login.email}, expires_delta=access_token_expires
    #     )
    #     return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})

    def reset_password(self, reset_data: UserResetPassword):
        user = self.db.query(User).filter(
            User.email == reset_data.email).first()
        if not user:
            raise HTTPException(status_code=400, detail="Email not found")

        new_verification_code = secrets.token_urlsafe(16)
        user.verification_code = new_verification_code
        self.db.commit()

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": reset_data.email}, expires_delta=access_token_expires
        )
        return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})

    def verify_email(self, verification_data: UserVerify):
        user = self.db.query(User).filter(
            User.verification_code == verification_data.verification_code).first()
        if not user:
            raise HTTPException(
                status_code=400, detail="Invalid verification code")

        user.is_active = True
        user.verification_code = None
        self.db.commit()

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})

    @staticmethod
    def send_verification_email(email: str, verification_code: str):
        subject = "Account Verification"
        body = f"Your verification code is: {verification_code}"
        message = MessageSchema(
            subject=subject,
            recipients=[email],
            body=body,
            subtype="html",
        )
        fm = FastMail(config_email)
        fm.send_message(message)

    def hash_password(self, password):
        pwd_context = CryptContext(
            schemes=["pbkdf2_sha256"], deprecated="auto")
        return pwd_context.hash(password)

    def verify_password_with_passlib(self, plain_password, hashed_password):
        pwd_context = CryptContext(
            schemes=["pbkdf2_sha256"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)

    def verify_password(self, plain_password, hashed_password, use_passlib=True):
        if use_passlib:
            return self.verify_password_with_passlib(plain_password, hashed_password)
        else:
            print(f"Stored Hashed Password: {hashed_password}")
            # Implement your custom password hashing and verification logic here
            # Example: You may use a different library or your own method
            pass

    def login(self, user_login: UserLogin):
        user = self.db.query(User).filter(
            User.email == user_login.email).first()
        if not user and not self.verify_password(user_login.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        # if not user.is_active:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST, detail="User not verified")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_login.email}, expires_delta=access_token_expires
        )
        return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
