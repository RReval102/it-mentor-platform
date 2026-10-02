import pytest
from fastapi.testclient import TestClient
from main import app, Base, engine

# Пересоздаем таблицы для чистоты эксперимента
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_create_course_db():
    """Тест: Добавление курса и сохранение его в БД"""
    payload = {
        "title": "PostgreSQL & FastAPI",
        "description": "Продвинутый курс по базам данных"
    }
    
    response = client.post("/api/courses", json=payload)
    
    # Проверяем успешный статус (201 Created)
    assert response.status_code == 201
    
    data = response.json()
    # Проверяем, что БД присвоила ID
    assert "id" in data
    assert data["title"] == payload["title"]
    assert data["description"] == payload["description"]

def test_get_courses_db():
    """Тест: Получение списка курсов из БД"""
    response = client.get("/api/courses")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Убеждаемся, что добавленный ранее курс присутствует в выдаче
    titles = [course["title"] for course in data]
    assert "PostgreSQL & FastAPI" in titles
