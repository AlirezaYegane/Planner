# Deep Focus Planner Backend

FastAPI backend for the Deep Focus Planner SaaS application.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📋 **Task Management** - Full CRUD operations for tasks and subtasks
- 🎯 **Kanban Boards** - Board and group management for visual task organization
- 📅 **Daily Planning** - Track daily plans with time allocation
- 🗄️ **PostgreSQL Database** - Robust data persistence with SQLAlchemy ORM
- 📚 **Auto-Generated API Docs** - OpenAPI/Swagger documentation

## Setup

### Prerequisites

- Python 3.11 or higher
- PostgreSQL database
- pip or poetry

### Installation

1. **Create virtual environment**:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**:
```bash
# Copy example env file
copy .env.example .env

# Edit .env and set your values:
# - DATABASE_URL (PostgreSQL connection string)
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_hex(32))")
```

4. **Set up PostgreSQL database**:
```bash
# Option 1: Local PostgreSQL
# Create database manually or use:
createdb planner_db

# Option 2: Docker (recommended for development)
docker run --name planner-postgres \
  -e POSTGRES_USER=planner_user \
  -e POSTGRES_PASSWORD=planner_password \
  -e POSTGRES_DB=planner_db \
  -p 5432:5432 \
  -d postgres:15
```

5. **Run database migrations** (tables will be created automatically on first run):
The app will automatically create tables using SQLAlchemy's `create_all()`.

## Running the API

### Development Mode

```bash
# Option 1: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using the main.py script
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `POST /api/v1/auth/login/json` - Login with JSON payload

#### Tasks
- `GET /api/v1/tasks/` - List all tasks (with filters)
- `POST /api/v1/tasks/` - Create new task
- `GET /api/v1/tasks/{task_id}` - Get task by ID
- `PATCH /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task

#### Boards & Groups
- `GET /api/v1/boards/` - List all boards
- `POST /api/v1/boards/` - Create new board
- `GET /api/v1/boards/{board_id}/groups` - Get groups for a board
- `POST /api/v1/boards/{board_id}/groups` - Create new group

#### Plans
- `GET /api/v1/plans/` - List all plans
- `POST /api/v1/plans/` - Create new plan
- `GET /api/v1/plans/{date}` - Get plan by date
- `PATCH /api/v1/plans/{date}` - Update plan

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependency injections
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py      # Authentication endpoints
│   │       │   ├── tasks.py     # Task management
│   │       │   ├── boards.py    # Board/group management
│   │       │   └── plans.py     # Daily planning
│   │       └── router.py        # API router aggregation
│   ├── core/
│   │   ├── config.py            # Settings configuration
│   │   ├── database.py          # Database connection
│   │   └── security.py          # JWT & password hashing
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── task.py              # Task & Subtask models
│   │   ├── board.py             # Board & Group models
│   │   └── plan.py              # Plan model
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── task.py              # Task schemas
│   │   ├── board.py             # Board schemas
│   │   └── plan.py              # Plan schemas
│   └── main.py                  # FastAPI app entry point
├── .env.example                 # Example environment variables
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=app tests/
```

## Database Schema

### Users
- `id`, `email`, `hashed_password`, `full_name`, `is_active`, `is_superuser`
- Timestamps: `created_at`, `updated_at`

### Tasks
- `id`, `name`, `description`, `status`, `priority`, `date`
- Foreign keys: `user_id`, `group_id`
- Statuses: `not_started`, `in_progress`, `done`, `postponed`
- Priorities: `low`, `medium`, `high`, `urgent`

### Subtasks
- `id`, `name`, `is_done`, `order`
- Foreign key: `task_id`

### Boards
- `id`, `name`, `description`
- Foreign key: `user_id`

### Groups (Kanban columns)
- `id`, `name`, `color`, `order`
- Foreign key: `board_id`

### Plans
- `id`, `date`, `sleep_time`, `commute_time`, `work_time`
- Foreign key: `user_id`

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://planner_user:planner_password@localhost:5432/planner_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
ENVIRONMENT=development
```

## Next Steps

1. ✅ Backend API is ready
2. 🔄 Connect to frontend (Next.js React app)
3. 🔄 Add Alembic for database migrations
4. 🔄 Add comprehensive tests
5. 🔄 Deploy to cloud (Railway/Render)

## License

Private project - All rights reserved
