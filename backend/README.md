# MathPro Backend Service (FastAPI + MySQL)

Backend API service for MWPSolver-KS, providing:

- **User side**: registration / login (JWT), problem solving (UniAPI), solving records, favorites
- **Admin side**: user management, solving model management, UniAPI configuration, records and favorites management

---

## Tech Stack

- **Framework**: FastAPI
- **Database**: MySQL (PyMySQL driver)
- **ORM**: SQLAlchemy 2
- **Validation**: Pydantic 2
- **HTTP client**: httpx (calls UniAPI LLMs)
- **Auth**: JWT (PyJWT)
- **Environment config**: python-dotenv
- **Password hashing**: bcrypt
- **Form / file upload parsing**: python-multipart (for avatar upload and similar endpoints)

---

## Directory Structure (aligned with the current version)

```text
backend/
├─ main.py                 # FastAPI entry: register routers, mount uploads, optionally seed model tables on startup
├─ config.py               # Config (DB, JWT, UniAPI, CORS, admin secret, etc.)
├─ database.py             # SQLAlchemy engine / session / base
├─ init_db.sql             # MySQL init script (schema + foreign keys)
├─ requirements.txt        # Python dependencies
├─ .env.example            # Environment variable example (do not commit a real .env)
├─ models/                 # ORM models
│  ├─ user.py              # users
│  ├─ record.py            # solution_records
│  ├─ favorite.py          # favorites
│  ├─ solve_model.py       # solve_models
│  └─ system_setting.py    # system_settings
├─ schemas/                # Pydantic schemas
│  ├─ auth.py
│  ├─ solve.py
│  ├─ record.py
│  ├─ favorite.py
│  └─ admin.py
└─ routers/                # API routers
   ├─ auth.py              # /api/auth/*
   ├─ solve.py             # /api/solve/*
   ├─ records.py           # /api/records/*
   ├─ favorites.py         # /api/favorites/*
   └─ admin.py             # /api/admin/*
```

---

## Requirements

- Python 3.10+ (recommended)
- MySQL 5.7+ / 8.0+

---

## Configuration (.env)

Copy the example file and edit it:

```bash
cd backend
cp .env.example .env
```

Key settings (see `config.py`):

- **Database**
  - `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`
- **UniAPI**
  - `UNIAPI_BASE_URL` (optional)
  - `UNIAPI_TOKEN` (required; otherwise solve / analyze endpoints return a hint)
  - `UNIAPI_MODEL` (default solving model)
  - `UNIAPI_MODEL_KNOWLEDGE` / `UNIAPI_MODEL_SEMANTIC` (optional: dedicated recognition models)
  - `UNIAPI_SOLVE_MODELS` (optional: fallback / seed when the DB `solve_models` table is empty)
- **JWT**
  - `JWT_SECRET` (must be changed in production)
  - `JWT_EXPIRE_MINUTES`
- **Admin**
  - `ADMIN_SECRET` (secret for accessing admin APIs)

> Note: At runtime, UniAPI Base URL / Token / default model are **read from the `system_settings` table first**; environment variables are used as defaults / fallbacks.

---

## Initialize the Database

Run `init_db.sql` in MySQL:

```bash
cd backend
mysql -u root -p < init_db.sql
```

The current `init_db.sql` creates and maintains these tables:

- `users`: users (username, password hash, nickname, avatar, etc.)
- `solution_records`: solving records (with `user_id` FK; set to `NULL` when the user is deleted)
- `favorites`: favorites (with `user_id` and `record_id` FKs; unique on `(user_id, record_id)`)
- `solve_models`: optional solving models (user dropdown + admin maintenance)
- `system_settings`: system config (UniAPI Base URL / Token / default model, etc.)

---

## Start the Service

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Start (recommended for development):

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

After startup:

- Health check: `GET /health`
- API docs: `/docs`

---

## API Overview (brief)

### User side

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/profile` (login required)
  - `PATCH /api/auth/profile` (login required)
  - `POST /api/auth/avatar/upload` (login required)
- **Solve**
  - `GET /api/solve/models`: list available solving LLMs (prefer DB; fall back to env if empty)
  - `POST /api/solve/analyze`: identify knowledge points and semantic contexts
  - `POST /api/solve`: solve (may include model / knowledge_points / semantic_contexts)
- **Records**
  - `POST /api/records/save` (login required)
  - `GET /api/records/list`
  - `GET /api/records/detail?id=...`
  - `DELETE /api/records/remove?id=...`
- **Favorites**
  - `POST /api/favorites/add` (login required)
  - `DELETE /api/favorites/remove?record_id=...` (login required)
  - `GET /api/favorites/list` (login required)
  - `GET /api/favorites/check?record_id=...`

### Admin side (admin secret required)

Admin authentication:

- Header `X-Admin-Token: <ADMIN_SECRET>`, or
- Header `Authorization: Bearer <ADMIN_SECRET>`

Main endpoints (see `routers/admin.py`):

- User management: list / create / edit / delete / reset password / upload avatar
- UniAPI config: read / update (writes to `system_settings`)
- Solving models table: CRUD (`solve_models`)
- Records and favorites: list / detail / delete

---

## CORS

By default, common local development origins are allowed (see `CORS_ORIGINS` and `CORS_ORIGIN_REGEX` in `config.py`).
The frontend default port is **3000**.

---

## Notes

- In production, always change `JWT_SECRET` and `ADMIN_SECRET` in `.env`
- Do not commit a real `backend/.env` to the repository
- Uploaded files such as avatars are stored under `backend/uploads/` and served statically via `/api/uploads/...`
