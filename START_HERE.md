# 🚀 Quick Start Guide - Deep Focus Planner

## ✅ Current Status

**Frontend:** ✅ **RUNNING** at http://localhost:3000  
**Backend:** ❌ Needs Python setup

---

## 🌐 View the Website NOW

**Open your browser and visit:**
### **http://localhost:3000**

> ⚠️ **Note**: The frontend will show errors when trying to connect to the backend API until the backend is running. You can still see the UI, but features requiring data won't work yet.

---

## 🔧 Setup Backend (One-time)

Your system has Python but needs proper configuration. Follow these steps:

### Step 1: Download & Install Python Properly

1. Go to https://www.python.org/downloads/
2. Download **Python 3.10** or newer
3. **IMPORTANT**: During installation, check ✅ **"Add Python to PATH"**
4. Complete the installation

### Step 2: Install Backend Dependencies

Open a **NEW** PowerShell window and run:

```powershell
cd "c:\Users\Asus\Desktop\PY projects\Planner\backend"

# Create clean virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

### Step 3: Start Backend Server

```powershell
# (Keep venv activated from Step 2)
python -m uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## ▶️ Start Servers (After Setup)

Once setup is complete, use these commands each time you want to run the app:

### Terminal 1 - Backend
```powershell
cd "c:\Users\Asus\Desktop\PY projects\Planner\backend"
venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

### Terminal 2 - Frontend  
```powershell
cd "c:\Users\Asus\Desktop\PY projects\Planner\frontend"
npm run dev
```

Then visit **http://localhost:3000** in your browser!

---

## 🎯 What You Can Do Now

Since the **frontend is already running**, you can:

1. Open http://localhost:3000 in your browser
2. See the landing page and UI design
3. Navigate through pages (though data features won't work without backend)

Once you setup the backend, you'll be able to:
- ✅ Sign up / Login
- ✅ Create tasks and boards
- ✅ Use the Kanban board
- ✅ Plan your day
- ✅ View analytics

---

## 🆘 Troubleshooting

**If "python" command not found:**
- Reinstall Python and check "Add to PATH"
- **OR** use `py` instead of `python` in all commands

**If npm not found:**
- Node.js path issues - you may need to restart your terminal

**If port already in use:**
- Backend: Use `--port 8001` instead of default 8000
- Frontend: It will prompt you to use a different port

---

## 📞 Need Help?

Let me know if you encounter any issues during setup!
