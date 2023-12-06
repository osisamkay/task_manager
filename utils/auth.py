from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import os

from models.user import User
from services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# SECRET_KEY = os.getenv("SECRET_KEY")
#
# if not SECRET_KEY:
#     raise EnvironmentError("SECRET_KEY is not set in the environment.")
SECRET_KEY="6c0135d43fe9e9e83b7c8adc96fc13cfab5a34fb555d746d30ddeb822b4865d"


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception


def get_current_user(token: dict = Depends(decode_token)):
    username = token.get("sub")
    return UserService.get_user_by_username(username)


def check_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have access to this resource")
    return current_user
