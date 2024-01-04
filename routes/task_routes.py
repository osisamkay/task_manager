from fastapi import APIRouter, status, HTTPException, Depends
from typing import List, Optional
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from models.task import TaskBase, TaskCreate
from database.database_session import TaskSessionLocal
from database.models.task_table_model import Task

router = APIRouter()

# Dependency to get the database session


def get_db():
    db = TaskSessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Depends(get_db)


@router.get('/tasks', response_model=List[Task])
def read_tasks(db: Session = Depends(get_db)):
    """
    Retrieve all tasks.

    :param db: Session: Database session
    :return: List of tasks
    """
    try:
        tasks = db.query(Task).all()
        return tasks
    except Exception as error:
        return JSONResponse(content={"detail": str(error)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/tasks", response_model=TaskCreate)
def create_task(task: TaskBase, db: Session = db_dependency):
    """
    Create a new task.

    :param task: TaskBase: Task data to be created
    :param db: Session: Database session
    :return: Created task
    """
    new_task = Task(**task.dict())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.get("/tasks/{id}", response_model=Task)
def get_task_id(id: int, db: Session = Depends(get_db)):
    """
    Retrieve a task by ID.

    :param id: int: Task ID
    :param db: Session: Database session
    :return: Task with the specified ID
    """
    retrieve_task = db.query(Task).get(id)

    if retrieve_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return retrieve_task


@router.put("/tasks/{id}", response_model=Task)
def update_task(id: int, task: TaskBase, db: Session = Depends(get_db)):
    """
    Update a task by ID.

    :param id: int: Task ID to update
    :param task: TaskBase: Updated task data
    :param db: Session: Database session
    :return: Updated task
    """
    existing_task = db.query(Task).get(id)

    if not existing_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    for field, value in task.dict(exclude_unset=True).items():
        setattr(existing_task, field, value)

    db.commit()
    db.refresh(existing_task)

    return existing_task


@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(id: int, db: Session = Depends(get_db)):
    """
    Delete a task by ID.

    :param id: int: Task ID to delete
    :param db: Session: Database session
    """
    get_task = db.query(Task).get(id)

    if not get_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(get_task)
    db.commit()
