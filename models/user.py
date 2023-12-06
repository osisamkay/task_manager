from pydantic import BaseModel


class User(BaseModel):
    email: str
    username: str
    password: str
    role: str


class CreateUser(User):
    pass


class UpdateUser(User):
    pass


class DeleteUser(BaseModel):
    id: int



