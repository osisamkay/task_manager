from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.models.task_table_model import Base as TaskBase
from database.models.user_table_model import Base as UserBase

DATABASE_URL = "sqlite:///./database/task_manager.sqlite"

# Creating engines and sessions for Task and User tables
task_engine = create_engine(DATABASE_URL)
TaskBase.metadata.create_all(bind=task_engine)
TaskSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=task_engine)

user_engine = create_engine(DATABASE_URL)
UserBase.metadata.create_all(bind=user_engine)
UserSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)
