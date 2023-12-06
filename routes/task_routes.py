from fastapi import APIRouter, status, HTTPException, Depends
from typing import List, Optional
from fastapi.responses import JSONResponse
from models.task import TaskBase, TaskCreate, Task
from database.database_session import SessionLocal
from sqlalchemy.orm import Session
from database.models.task_table_model import TaskTableModel

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Depends(get_db)


@router.get('/tasks')
def read_tasks(db: Session = Depends(get_db)):
    """
    The read_tasks function will return a list of all tasks in the database.
        The function is called by the read_tasks endpoint, which is defined below.

    :param db: Session: Get the database session
    :return: A list of tasks
    :doc-author: Trelent
    """
    try:
        tasks = db.query(TaskTableModel).all()
        return tasks
    except Exception as error:
        return JSONResponse(content={"detail": str(error)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/tasks", response_model=TaskCreate)
def create_task(task: TaskBase, db: Session = db_dependency):
    """
    The create_task function creates a new task in the database.

    :param task: TaskBase: Pass the task object to be created
    :param db: Session: Pass the database session to the function
    :return: A tasktablemodel object
    """
    # try:
    new_task = TaskTableModel(**task.__dict__)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/{id}", status_code=status.HTTP_200_OK)
def get_task_id(id: int, db: Session = Depends(get_db)):
    """
        The get_task_id function retrieves a task from the database based on its id.
            If no task is found, it raises an HTTP 404 error.
            If there is an error in retrieving the data, it raises an HTTP 500 error.

        :param id: int: Specify the type of data that is expected to be passed in
        :param db: Session: Pass the database session to the function
        :return: The task with the specified id
        :doc-author: Trelent
        """

    retrieve_task = db.query(TaskTableModel).get(id)

    if retrieve_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return retrieve_task



@router.put("/task/{id}", status_code=status.HTTP_200_OK, response_model=Optional[TaskCreate])
def update_task(id: int, task: TaskBase, db: Session = Depends(get_db)):
    """
    Update a task by its ID.

    Args:
        id (int): The ID of the task to update.
        task (TaskBase): The data to update the task with.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        Optional[TaskCreate]: The updated task, or None if the task is not found.

    Raises:
        HTTPException: 404 Not Found if the task with the given ID is not found.
        HTTPException: 500 Internal Server Error for unexpected errors during the update.
    """
    try:
        existing_task = db.query(TaskTableModel).get(id)

        if not existing_task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        for field, value in task.__dict__.items():
            setattr(existing_task, field, value)

        db.commit()
        db.refresh(existing_task)

        return existing_task
    except Exception as error:
        print(f"error:{error}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error))


@router.delete("/task/{id}", status_code=status.HTTP_200_OK)
def delete_task(id, db: Session = Depends(get_db)):
    get_task = db.query(TaskTableModel).get(id)
    db.delete(get_task)
    db.commit()
    db.refresh(get_task)