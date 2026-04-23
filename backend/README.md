# Construction Platform — Backend

FastAPI + PostgreSQL + SQLAlchemy backend with AI-powered receipt OCR.

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- (Optional) Google Cloud Vision API service account for OCR

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5433/construction_db
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json   # optional
UPLOAD_DIR=./uploads
```

### 4. Create the database

```bash
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE construction_db;"
```

### 5. Run database migrations

```bash
alembic upgrade head
```

> **First-time:** generate the initial migration from models:
> ```bash
> alembic revision --autogenerate -m "initial"
> alembic upgrade head
> ```

### 6. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API is available at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

## Google Cloud Vision API (optional)

1. Create a GCP project and enable the **Cloud Vision API**.
2. Create a service account and download the JSON key.
3. Set `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` in `.env`.

Without Vision API credentials the receipt upload still works — the OCR step is
skipped and no cost record is created automatically.

---

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py        # Pydantic settings (reads .env)
│   │   ├── database.py      # Async SQLAlchemy engine + Base
│   │   └── security.py      # JWT, bcrypt, auth dependencies
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── routers/             # FastAPI route handlers
│   │   ├── auth.py          # POST /auth/register, /auth/login
│   │   ├── users.py         # GET /users/me, /users
│   │   ├── projects.py      # CRUD /projects
│   │   ├── tasks.py         # CRUD /tasks
│   │   ├── costs.py         # GET /costs
│   │   └── receipts.py      # POST /receipts/upload (OCR)
│   ├── services/
│   │   └── ocr_service.py   # Google Vision API integration
│   └── main.py
├── alembic/                 # Database migrations
├── requirements.txt
└── .env.example
```

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | — | Create account |
| POST | /auth/login | — | Get JWT token |
| GET | /users/me | any | Current user |
| GET | /users | manager | All users |
| GET | /projects | any | List projects |
| POST | /projects | manager | Create project |
| PUT | /projects/{id} | manager | Update project |
| DELETE | /projects/{id} | manager | Delete project |
| POST | /projects/{id}/assign | manager | Assign builder |
| GET | /tasks | any | List tasks |
| POST | /tasks | manager | Create task |
| PATCH | /tasks/{id}/status | any | Update task status |
| POST | /tasks/{id}/photo | any | Upload task photo |
| GET | /costs/project/{id} | any | Project costs |
| POST | /receipts/upload | any | Upload + OCR receipt |
