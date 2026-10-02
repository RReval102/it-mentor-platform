from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# === НАСТРОЙКА БАЗЫ ДАННЫХ ===
# В продакшене (PostgreSQL):
# DATABASE_URL = "postgresql://username:password@localhost/it_mentor_db"

# Для локального запуска и тестирования используем SQLite,
# чтобы не требовать установки Postgres локально.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Настройка подключения (check_same_thread только для SQLite)
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# === МОДЕЛИ БД ===
class CourseDB(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# === FASTAPI ПРИЛОЖЕНИЕ ===
app = FastAPI(title="IT Mentor API")

# Разрешаем CORS для запросов с фронтенда (SPA)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === PYDANTIC СХЕМЫ (для валидации API) ===
class CourseCreate(BaseModel):
    title: str
    description: str

class CourseResponse(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True

# === ЭНДПОИНТЫ ===
@app.post("/api/courses", response_model=CourseResponse, status_code=201)
def create_course(course: CourseCreate):
    """
    Эндпоинт для добавления нового курса в базу данных.
    """
    db = SessionLocal()
    try:
        db_course = CourseDB(title=course.title, description=course.description)
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при записи в БД")
    finally:
        db.close()

@app.get("/api/courses", response_model=list[CourseResponse])
def get_courses():
    """
    Эндпоинт для получения списка всех курсов из базы данных.
    """
    db = SessionLocal()
    try:
        courses = db.query(CourseDB).all()
        return courses
    finally:
        db.close()
