from pydantic import BaseModel, Field
from pydantic.networks import EmailStr


class User(BaseModel):
    username: str
    password: str


class CreateUser(User):
    email: str


class UpdateUser(User):
    pass


class DeleteUser(BaseModel):
    id: int
