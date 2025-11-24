import sqlite3
import datetime
import pandas as pd
from src.config import DB_PATH

def get_conn():
    """Return a SQLite connection for the planner database."""
    return sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)


def init_db():
    """Create tables if they do not exist yet and handle migrations for Kanban evolution."""
    conn = get_conn()
    c = conn.cursor()

    # Board table (for Monday.com style boards - optional, keeping for compatibility)
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS board (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT
        );
        """
    )

    # task_group table (for Monday.com style - keeping for compatibility)
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS task_group (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            color TEXT,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY(board_id) REFERENCES board(id)
        );
        """
    )

    # Main project (Main Topics in new terminology)
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS project (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT,
            status TEXT DEFAULT 'Not Started',
            order_index INTEGER DEFAULT 0,
            description TEXT
        );
        """
    )

    # Sub-task for a specific day (Subtasks in new terminology)
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            group_id INTEGER,
            date TEXT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'Not Started',
            priority TEXT DEFAULT 'Medium',
            order_index INTEGER DEFAULT 0,
            description TEXT,
            start_time TEXT,
            end_time TEXT,
            duration_minutes INTEGER,
            FOREIGN KEY(project_id) REFERENCES project(id),
            FOREIGN KEY(group_id) REFERENCES task_group(id)
        );
        """
    )

    # Small parts (Parts in new terminology)
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS part (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'Not Started',
            is_done INTEGER NOT NULL DEFAULT 0,
            order_index INTEGER NOT NULL DEFAULT 0,
            description TEXT,
            start_time TEXT,
            end_time TEXT,
            duration_minutes INTEGER,
            completed_at TEXT,
            FOREIGN KEY(task_id) REFERENCES task(id)
        );
        """
    )

    # User settings for sleep/commute tracking
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            sleep_start_time TEXT,
            wake_up_time TEXT,
            commute_minutes_total INTEGER DEFAULT 0,
            created_at TEXT
        );
        """
    )

    # Migration: Add new columns if they don't exist
    c.execute("PRAGMA table_info(project)")
    project_columns = [row[1] for row in c.fetchall()]
    
    if "status" not in project_columns:
        c.execute("ALTER TABLE project ADD COLUMN status TEXT DEFAULT 'Not Started'")
    if "order_index" not in project_columns:
        c.execute("ALTER TABLE project ADD COLUMN order_index INTEGER DEFAULT 0")
    if "date" not in project_columns:
        c.execute("ALTER TABLE project ADD COLUMN date TEXT")
    if "description" not in project_columns:
        c.execute("ALTER TABLE project ADD COLUMN description TEXT")

    c.execute("PRAGMA table_info(task)")
    task_columns = [row[1] for row in c.fetchall()]
    
    if "status" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN status TEXT DEFAULT 'Not Started'")
    if "order_index" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN order_index INTEGER DEFAULT 0")
    if "description" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN description TEXT")
    if "start_time" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN start_time TEXT")
    if "end_time" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN end_time TEXT")
    if "duration_minutes" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN duration_minutes INTEGER")
    if "priority" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN priority TEXT DEFAULT 'Medium'")
    if "group_id" not in task_columns:
        c.execute("ALTER TABLE task ADD COLUMN group_id INTEGER REFERENCES task_group(id)")

    c.execute("PRAGMA table_info(part)")
    part_columns = [row[1] for row in c.fetchall()]
    
    if "status" not in part_columns:
        # Migrate existing data: if is_done=1, set status='Done', else 'Not Started'
        c.execute("ALTER TABLE part ADD COLUMN status TEXT DEFAULT 'Not Started'")
        c.execute("UPDATE part SET status = 'Done' WHERE is_done = 1")
    if "description" not in part_columns:
        c.execute("ALTER TABLE part ADD COLUMN description TEXT")
    if "start_time" not in part_columns:
        c.execute("ALTER TABLE part ADD COLUMN start_time TEXT")
    if "end_time" not in part_columns:
        c.execute("ALTER TABLE part ADD COLUMN end_time TEXT")
    if "duration_minutes" not in part_columns:
        c.execute("ALTER TABLE part ADD COLUMN duration_minutes INTEGER")

    conn.commit()
    conn.close()


def get_or_create_project(name: str) -> int:
    """Get project id by name, or create it if it does not exist."""
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id FROM project WHERE name = ?", (name.strip(),))
    row = c.fetchone()
    if row:
        project_id = row[0]
    else:
        c.execute("INSERT INTO project(name) VALUES (?)", (name.strip(),))
        project_id = c.lastrowid
        conn.commit()
    conn.close()
    return project_id


def add_task_with_parts(
    project_name: str, date: datetime.date, task_name: str, part_texts
):
    """Create a task under a project with its parts for a given date."""
    project_id = get_or_create_project(project_name)
    conn = get_conn()
    c = conn.cursor()

    c.execute(
        "INSERT INTO task(project_id, date, name) VALUES (?, ?, ?)",
        (project_id, date.isoformat(), task_name.strip()),
    )
    task_id = c.lastrowid

    for idx, txt in enumerate(part_texts):
        txt = txt.strip()
        if not txt:
            continue
        c.execute(
            "INSERT INTO part(task_id, name, order_index) VALUES (?, ?, ?)",
            (task_id, txt, idx),
        )

    conn.commit()
    conn.close()


def get_parts_for_date(date: datetime.date):
    """Return all parts (with project & task info) for a given date."""
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(
        """
        SELECT p.id AS part_id,
               p.name AS part_name,
               p.is_done,
               p.order_index,
               t.id AS task_id,
               t.name AS task_name,
               pr.id AS project_id,
               pr.name AS project_name,
               p.completed_at
        FROM part p
        JOIN task t ON p.task_id = t.id
        JOIN project pr ON t.project_id = pr.id
        WHERE t.date = ?
        ORDER BY pr.name, t.id, p.order_index;
        """,
        (date.isoformat(),),
    )
    rows = c.fetchall()
    conn.close()
    return rows


def update_part_done(part_id: int, done: bool):
    """Update completion status of a part."""
    conn = get_conn()
    c = conn.cursor()
    completed_at = datetime.datetime.now().isoformat() if done else None
    c.execute(
        "UPDATE part SET is_done = ?, completed_at = ? WHERE id = ?",
        (1 if done else 0, completed_at, part_id),
    )
    conn.commit()
    conn.close()


def get_completion_by_day(
    start_date: datetime.date, end_date: datetime.date
) -> pd.DataFrame:
    """
    Aggregate completion per day between start_date and end_date.
    Returns a DataFrame with date, total_parts, done_parts, completion%.
    """
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(
        """
        SELECT t.date AS date,
               COUNT(*) AS total_parts,
               SUM(p.is_done) AS done_parts
        FROM part p
        JOIN task t ON p.task_id = t.id
        WHERE DATE(t.date) BETWEEN DATE(?) AND DATE(?)
        GROUP BY t.date
        ORDER BY t.date;
        """,
        (start_date.isoformat(), end_date.isoformat()),
    )
    rows = c.fetchall()
    conn.close()

    data = []
    for r in rows:
        total = r["total_parts"]
        done = r["done_parts"] or 0
        pct = done / total if total else 0
        data.append(
            {
                "date": datetime.date.fromisoformat(r["date"]),
                "total_parts": total,
                "done_parts": done,
                "completion": pct * 100,
            }
        )

    if not data:
        return pd.DataFrame(columns=["date", "total_parts", "done_parts", "completion"])
    return pd.DataFrame(data)


def get_existing_dates() -> list[datetime.date]:
    """Return a list of all dates that have at least one task."""
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT DISTINCT date FROM task ORDER BY date DESC;")
    rows = c.fetchall()
    conn.close()
    return [datetime.date.fromisoformat(r["date"]) for r in rows]


# ---------- BOARD & GROUP FUNCTIONS ----------

def get_all_boards():
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM board ORDER BY name")
    rows = c.fetchall()
    conn.close()
    return rows


def create_board(name: str):
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO board(name, created_at) VALUES (?, ?)", (name, datetime.datetime.now().isoformat()))
        conn.commit()
        return c.lastrowid
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()


def get_groups_for_board(board_id: int):
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM task_group WHERE board_id = ? ORDER BY order_index", (board_id,))
    rows = c.fetchall()
    conn.close()
    return rows


def create_group(board_id: int, name: str, color: str = "#579bfc"):
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO task_group(board_id, name, color) VALUES (?, ?, ?)", (board_id, name, color))
    conn.commit()
    conn.close()


def get_tasks_for_group(group_id: int):
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM task WHERE group_id = ? ORDER BY id", (group_id,))
    rows = c.fetchall()
    conn.close()
    return rows


def update_task_status(task_id: int, status: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE task SET status = ? WHERE id = ?", (status, task_id))
    conn.commit()
    conn.close()


def update_task_priority(task_id: int, priority: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE task SET priority = ? WHERE id = ?", (priority, task_id))
    conn.commit()
    conn.close()


def create_task_in_group(group_id: int, name: str, date: datetime.date = None):
    conn = get_conn()
    c = conn.cursor()
    date_str = date.isoformat() if date else datetime.date.today().isoformat()
    c.execute("INSERT INTO task(group_id, name, date, status, priority) VALUES (?, ?, ?, 'Not Started', 'Medium')", (group_id, name, date_str))
    conn.commit()
    conn.close()


def update_task_name(task_id: int, name: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE task SET name = ? WHERE id = ?", (name, task_id))
    conn.commit()
    conn.close()


def update_task_date(task_id: int, date: datetime.date):
    conn = get_conn()
    c = conn.cursor()
    date_str = date.isoformat() if date else None
    c.execute("UPDATE task SET date = ? WHERE id = ?", (date_str, task_id))
    conn.commit()
    conn.close()


def delete_task(task_id: int):
    conn = get_conn()
    c = conn.cursor()
    # Delete parts first (cascading)
    c.execute("DELETE FROM part WHERE task_id = ?", (task_id,))
    c.execute("DELETE FROM task WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()


def update_task_name(task_id: int, name: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE task SET name = ? WHERE id = ?", (name, task_id))
    conn.commit()
    conn.close()


def update_task_date(task_id: int, date: datetime.date):
    conn = get_conn()
    c = conn.cursor()
    date_str = date.isoformat() if date else None
    c.execute("UPDATE task SET date = ? WHERE id = ?", (date_str, task_id))
    conn.commit()
    conn.close()


def delete_task(task_id: int):
    conn = get_conn()
    c = conn.cursor()
    # Delete parts first (cascading)
    c.execute("DELETE FROM part WHERE task_id = ?", (task_id,))
    c.execute("DELETE FROM task WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
