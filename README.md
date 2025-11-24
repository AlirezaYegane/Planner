# Deep Focus Planner - Full Stack SaaS Application

A professional planning and productivity platform built with modern web technologies for scalable SaaS deployment.

![CI/CD](https://github.com/AlirezaYegane/Planner/actions/workflows/ci.yml/badge.svg)

## 🚀 Technology Stack

**Backend:** FastAPI + PostgreSQL (or SQLite for dev) + SQLAlchemy + JWT Authentication  
**Frontend:** Next.js 14 + TypeScript + Redux Toolkit + Tailwind CSS  
**Database:** PostgreSQL (Production) / SQLite (Development)

## 📂 Project Structure

```
Planner/
├── backend/          # FastAPI REST API
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Configuration, security, database
│   │   ├── models/   # SQLAlchemy models
│   │   └── schemas/  # Pydantic schemas
│   ├── tests/        # Backend tests
│   └── requirements.txt
├── frontend/         # Next.js React application  
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # API client & utilities
│   ├── store/        # Redux Toolkit store
│   └── package.json
├── legacy_prototype/ # Old Streamlit app (deprecated)
└── docker-compose.yml  # PostgreSQL container
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** and **npm** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

## 📥 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AlirezaYegane/Planner.git
cd Planner
```

### 2. Backend Setup (FastAPI)

The backend is configured to use **SQLite** by default for local development, so you don't need Docker immediately.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Run the Backend Server

```bash
uvicorn app.main:app --reload
```

**Backend is now running at:** http://localhost:8000  
**API Documentation (Swagger UI):** http://localhost:8000/docs  
**Alternative API Docs (ReDoc):** http://localhost:8000/redoc

### 3. Frontend Setup (Next.js)

Open a **new terminal window/tab** (keep the backend running).

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend is now running at:** http://localhost:3000

### 4. Create Admin Test User (Optional)

For testing purposes, you can create an admin user:

```bash
cd backend

# Make sure virtual environment is activated
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

python create_admin.py
```

This creates an admin user with the following credentials:

```
Email:    admin@planner.app
Password: admin123
```

> [!WARNING]
> **Security Notice:** This is a test account for development only. Never use these credentials in production!

You can now login at http://localhost:3000/login with these credentials to test all features.

**To change the admin password later:**
1. Edit `backend/create_admin.py` and change the password
2. Run `python create_admin.py` again

## ✨ Features

### Implemented Features

- ✅ **User Authentication (JWT)** - Secure signup/login with token-based authentication
- ✅ **Task Management** - Create, edit, delete tasks with subtasks support
- ✅ **Kanban Boards** - Organize tasks in customizable boards with groups
- ✅ **Daily Planning** - Plan your day with time tracking (sleep, commute, work time)
- ✅ **Dashboard** - View statistics and progress metrics
- ✅ **RESTful API** - Well-documented endpoints with auto-generated Swagger docs
- ✅ **Type Safety** - TypeScript on frontend, Pydantic validation on backend
- ✅ **Redux State Management** - Centralized state with Redux Toolkit
- ✅ **Responsive UI** - Modern, mobile-friendly interface with Tailwind CSS

### Roadmap

- 🔄 Drag-and-drop Kanban functionality
- 🔄 Advanced analytics & charts
- 🔄 Real-time WebSocket updates
- 🔄 Multi-tenancy & team collaboration
- 🔄 Stripe payment integration

## 🎯 How to Use the Application

### First Time Setup

1. **Open your browser** and navigate to http://localhost:3000
2. **Sign Up** by clicking "Sign Up" or navigating to http://localhost:3000/signup
   - Enter your email address
   - Create a password (at least 6 characters)
   - Optionally add your full name
3. **Login** at http://localhost:3000/login with your credentials

### Feature Walkthrough

#### 1. **Dashboard** (`/dashboard`)

The dashboard is your command center showing:
- **Total Tasks** - Number of tasks for today
- **Completed Tasks** - Tasks marked as done
- **In Progress** - Tasks currently being worked on
- **Completion Percentage** - Your progress for the day

#### 2. **Kanban Board** (`/dashboard/kanban`)

Organize your work visually:
- **Create Boards** - Click "+" to create a new board
- **Add Groups** - Create columns (e.g., "To Do", "In Progress", "Done")
- **Add Tasks** - Create tasks within groups
- **Customize** - Set colors and priorities for visual organization

#### 3. **Daily Planner** (`/dashboard/daily-plan`)

Plan your entire day:
- **Select a Date** - Choose which day to plan
- **Time Allocation** - Set hours for sleep, commute, work
- **Task Scheduling** - Add tasks to your daily plan
- **Track Progress** - Mark tasks as complete throughout the day

#### 4. **Analytics** (`/dashboard/analytics`)

View your productivity metrics:
- **Completion Trends** - See how you're progressing over time
- **Task Statistics** - Analyze your task completion rates
- **Time Tracking** - Review how you allocate your time

#### 5. **Team Management** (`/dashboard/team`)

Collaborate with others:
- **Create Teams** - Set up team workspaces
- **Invite Members** - Add team members by email
- **Shared Boards** - Collaborate on boards with your team

## 📡 API Endpoints

The backend provides a comprehensive REST API:

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT token)
- `POST /api/v1/auth/login/json` - JSON-based login

### Tasks
- `GET /api/v1/tasks/` - List tasks (with optional filters)
- `POST /api/v1/tasks/` - Create task
- `GET /api/v1/tasks/{id}` - Get specific task
- `PATCH /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task

### Boards
- `GET /api/v1/boards/` - List boards
- `POST /api/v1/boards/` - Create board
- `GET /api/v1/boards/{id}` - Get specific board
- `DELETE /api/v1/boards/{id}` - Delete board

### Plans
- `GET /api/v1/plans/` - List plans
- `POST /api/v1/plans/` - Create plan
- `GET /api/v1/plans/{date}` - Get plan for specific date
- `PATCH /api/v1/plans/{date}` - Update plan

### Teams
- `GET /api/v1/teams/` - List teams
- `POST /api/v1/teams/` - Create team
- `POST /api/v1/teams/{id}/members` - Add team member

**Full API documentation:** http://localhost:8000/docs

## 🗄️ Database

**Development Mode:**  
Uses SQLite (`planner.db` created automatically in `backend/` directory)

**Production Mode:**  
Supports PostgreSQL - update `DATABASE_URL` in your environment variables

To switch to PostgreSQL for local development:
1. Start PostgreSQL with Docker: `docker-compose up -d`
2. Set environment variable: `DATABASE_URL=postgresql://user:password@localhost:5432/planner`

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=sqlite:///./planner.db  # or PostgreSQL connection string

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS_STR=http://localhost:3000,http://localhost:8000

# Application
PROJECT_NAME=Deep Focus Planner API
VERSION=1.0.0
ENVIRONMENT=development
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Manual Testing Checklist

- [ ] Can sign up a new user
- [ ] Can login with credentials
- [ ] Dashboard loads without errors
- [ ] Can create a new task
- [ ] Can create a Kanban board
- [ ] Can create a daily plan
- [ ] Can view analytics
- [ ] API endpoints respond correctly (check at http://localhost:8000/docs)

## 🚀 Deployment

### Recommended Deployment Options

**Backend:**
- [Railway](https://railway.app/) - Easy Python app deployment
- [Render](https://render.com/) - Free tier available
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

**Frontend:**
- [Vercel](https://vercel.com/) - Optimized for Next.js (recommended)
- [Netlify](https://www.netlify.com/)

**Database:**
- [Railway](https://railway.app/) - PostgreSQL hosting
- [Supabase](https://supabase.com/) - PostgreSQL with additional features
- [AWS RDS](https://aws.amazon.com/rds/)

## 🔍 Troubleshooting

### Backend won't start

- **Error: "No module named 'app'"**
  - Make sure you're in the `backend/` directory
  - Ensure virtual environment is activated
  - Run `pip install -r requirements.txt`

- **Error: "Address already in use"**
  - Port 8000 is occupied. Change port: `uvicorn app.main:app --reload --port 8001`

### Frontend won't start

- **Error: "Cannot find module"**
  - Delete `node_modules/` and `.next/`
  - Run `npm install` again
  
- **Error: "Port 3000 already in use"**
  - Change port: `npm run dev -- -p 3001`

### API connection issues

- Ensure backend is running on http://localhost:8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify CORS settings in backend `config.py`

## 👤 Author

**Alireza Yegane**

**GitHub:** https://github.com/AlirezaYegane/Planner

---

**📝 Note:** The legacy Streamlit version has been moved to the `legacy_prototype/` directory and is no longer actively maintained.

## 📄 License

This project is private and proprietary.
