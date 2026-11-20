import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure parent directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database.create_tables import create_tables
from database.seed_data import seed_data
from database.create_auth_tables import create_auth_tables
from database.migrate_four_roles_hierarchy import migrate_database
from database.db_connection import get_connection

from backend.routes_auth import router as auth_router
from backend.routes_admin import router as admin_router
from backend.routes_data import router as data_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist, are seeded, and migrated to 4-role hierarchy
    try:
        create_tables()
        seed_data()
        create_auth_tables()
        migrate_database()
        print("TRAVELSPHERE OPS Database initialized, migrated to 4-role hierarchy, and verified.")
    except Exception as e:
        print(f"Warning during DB startup migration: {e}")
    yield

app = FastAPI(
    title="TRAVELSPHERE OPS – Smart Franchise Management & Performance Intelligence API",
    description="Enterprise REST API for TravelSphere Ops supporting four-role RBAC, franchise & branch level data isolation, and operations intelligence.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under both /api/v1 (recommended spec) and /api (standard fallback)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(data_router, prefix="/api/v1")

app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(data_router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": "TRAVELSPHERE OPS API",
        "tagline": "Smart Franchise Management & Performance Intelligence",
        "heading": "Manage Every Journey. Empower Every Franchise.",
        "status": "Online",
        "version": "2.0.0"
    }

@app.get("/health")
@app.get("/api/v1/health")
def health():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM franchises")
        franchises_count = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM branches")
        branches_count = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM users")
        users_count = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM registration_requests")
        registrations_count = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM tasks")
        tasks_count = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM bookings")
        bookings_count = cursor.fetchone()["cnt"]
        conn.close()
        db_healthy = True
    except Exception as e:
        db_healthy = False
        franchises_count = branches_count = users_count = registrations_count = tasks_count = bookings_count = 0

    return {
        "status": "healthy" if db_healthy else "degraded",
        "system": "TRAVELSPHERE OPS",
        "database": {
            "connected": db_healthy,
            "franchises": franchises_count,
            "branches": branches_count,
            "users": users_count,
            "registrationRequests": registrations_count,
            "tasks": tasks_count,
            "bookings": bookings_count
        }
    }

if __name__ == "__main__":
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=True)
