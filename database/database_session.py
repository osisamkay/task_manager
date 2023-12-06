from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.models.task_table_model import Base

DATABASE_URL = "sqlite:///./database/task_manager.sqlite"
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)