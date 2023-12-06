from pydantic import BaseModel
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: str
    due_date: datetime

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
        }


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class TaskDelete(BaseModel):
    id: int


class Task(TaskBase):
    id: int

