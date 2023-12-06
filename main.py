from fastapi import FastAPI
from routes import task_routes, user_routes
from dotenv import load_dotenv


load_dotenv()

app = FastAPI(debug=True)

app.include_router(task_routes.router)
app.include_router(user_routes.router)


