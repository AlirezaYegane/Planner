#!/usr/bin/env python3.10
import sqlite3
import datetime

import streamlit as st
import pandas as pd
import altair as alt

try:
    import jdatetime  # For Persian (Jalali) dates
except ImportError:
    jdatetime = None

DB_PATH = "planner.db"


# ---------- DB LAYER ----------

def get_conn():
    """Return a SQLite connection for the planner database."""
    return sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)


def init_db():
    """Create tables if they do not exist yet."""
    conn = get_conn()
    c = conn.cursor()

    # Main project (e.g., Australia, Canada, Linear Algebra, Code)
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS project (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
        """
    )

    # Sub-task for a specific day
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES project(id)
        );
        """
    )

    # Small parts (steps) that can be checked as done
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS part (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            is_done INTEGER NOT NULL DEFAULT 0,
            order_index INTEGER NOT NULL DEFAULT 0,
            completed_at TEXT,
            FOREIGN KEY(task_id) REFERENCES task(id)
        );
        """
    )

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
    """
    Create a task under a project with its parts for a given date.

    If no parts are provided, a single default part "Done" is created so that
    the task is still trackable in the checklist.
    """
    project_id = get_or_create_project(project_name)
    conn = get_conn()
    c = conn.cursor()

    c.execute(
        "INSERT INTO task(project_id, date, name) VALUES (?, ?, ?)",
        (project_id, date.isoformat(), task_name.strip()),
    )
    task_id = c.lastrowid

    cleaned_parts = [p.strip() for p in part_texts if p.strip()]
    if not cleaned_parts:
        cleaned_parts = ["Done"]

    for idx, txt in enumerate(cleaned_parts):
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


def compute_streak(df: pd.DataFrame, threshold: float = 80.0) -> int:
    """Return the best streak of days with completion >= threshold%."""
    if df.empty:
        return 0
    df_sorted = df.sort_values("date")
    streak = 0
    best = 0
    for _, row in df_sorted.iterrows():
        if row["completion"] >= threshold:
            streak += 1
            best = max(best, streak)
        else:
            streak = 0
    return best


def get_existing_dates() -> list[datetime.date]:
    """Return a list of all dates that have at least one task."""
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT DISTINCT date FROM task ORDER BY date DESC;")
    rows = c.fetchall()
    conn.close()
    return [datetime.date.fromisoformat(r["date"]) for r in rows]


# ---------- DATE HELPERS ----------

def gregorian_to_persian_str(date: datetime.date) -> str:
    """Convert a Gregorian date to a Jalali (Persian) date string."""
    if jdatetime is None:
        return "Install 'jdatetime' to see Persian date"
    jd = jdatetime.date.fromgregorian(date=date)
    return jd.strftime("%Y-%m-%d")  # e.g., 1404-09-02


# ---------- UI PAGES ----------

def init_plan_items_state():
    """Initialize session state for multi-row plan editor."""
    if "plan_items" not in st.session_state:
        st.session_state.plan_items = [
            {"project": "", "task": "", "parts": ""}
        ]


def page_add_plan():
    st.header("📅 Plan for Today")
    today = datetime.date.today()
    date = st.date_input("Date", value=today)
    persian_date = gregorian_to_persian_str(date)
    st.caption(f"Persian date: {persian_date}")

    init_plan_items_state()

    st.subheader("Plan items for this day")

    new_items = []
    for idx, item in enumerate(st.session_state.plan_items):
        st.markdown(f"#### Item {idx + 1}")
        col1, col2 = st.columns(2)
        with col1:
            project = st.text_input(
                "Main project",
                value=item.get("project", ""),
                key=f"project_{idx}",
                placeholder="e.g., Australia, Linear Algebra",
            )
        with col2:
            task = st.text_input(
                "Sub-task",
                value=item.get("task", ""),
                key=f"task_{idx}",
                placeholder="e.g., promotion letter, Lecture 71",
            )

        parts_text = st.text_area(
            "Parts (one line per small step: 1, 2, 3 or micro actions)",
            value=item.get("parts", ""),
            key=f"parts_{idx}",
            height=120,
        )

        new_items.append({"project": project, "task": task, "parts": parts_text})
        st.markdown("---")

    st.session_state.plan_items = new_items

    col_add, col_remove = st.columns(2)
    with col_add:
        if st.button("➕ Add another item"):
            st.session_state.plan_items.append({"project": "", "task": "", "parts": ""})
    with col_remove:
        if st.button("➖ Remove last item"):
            if st.session_state.plan_items:
                st.session_state.plan_items.pop()

    if st.button("💾 Save all items for this date", type="primary"):
        saved_any = False
        for item in st.session_state.plan_items:
            project_name = item["project"].strip()
            task_name = item["task"].strip() or project_name  # fallback
            parts_text = item["parts"]

            if not project_name:
                # Skip empty rows
                continue

            parts = [line for line in parts_text.splitlines() if line.strip()]
            add_task_with_parts(project_name, date, task_name, parts)
            saved_any = True

        if saved_any:
            st.success("All non-empty items were saved for this date ✅")
        else:
            st.error("Nothing to save: fill at least one project name.")


def motivational_message(pct: float) -> str:
    """Return a short motivational string based on daily completion."""
    if pct >= 90:
        return "Almost operating at robot level. Respect. 👑"
    if pct >= 75:
        return "Strong progress. A little extra push and you crush the day. ⭐"
    if pct >= 50:
        return "Halfway done. Perfect time to lock in and avoid doom-scrolling."
    if pct > 0:
        return "You started, and that matters. Now keep the momentum."
    return "Currently at 0%. Save the day by completing at least one part."


def page_checklist():
    st.header("✅ Daily Checklist")
    today = datetime.date.today()
    date = st.date_input("Date", value=today, key="checklist_date")
    persian_date = gregorian_to_persian_str(date)
    st.caption(f"Persian date: {persian_date}")

    parts = get_parts_for_date(date)

    if not parts:
        st.info("No plan for this day yet. Go to 'Add daily plan' and create one.")
        return

    total_parts = len(parts)
    done_parts = sum(1 for r in parts if r["is_done"])
    pct = (done_parts / total_parts) * 100 if total_parts else 0

    # Compute task-level completion
    task_ids = sorted({r["task_id"] for r in parts})
    tasks_done = 0
    for tid in task_ids:
        task_parts = [r for r in parts if r["task_id"] == tid]
        if all(r["is_done"] for r in task_parts):
            tasks_done += 1

    remaining_parts = total_parts - done_parts
    remaining_tasks = len(task_ids) - tasks_done

    st.subheader(f"Progress: {pct:.1f}%  ({done_parts} of {total_parts} parts)")
    st.caption(motivational_message(pct))

    # Hierarchical checklist with live saving
    current_project = None
    current_task = None

    for r in parts:
        proj = r["project_name"]
        task = r["task_name"]

        if proj != current_project:
            st.markdown(f"### 🧭 {proj}")
            current_project = proj
            current_task = None

        if task != current_task:
            st.markdown(f"**🔹 {task}**")
            current_task = task

        part_id = r["part_id"]
        checked = bool(r["is_done"])
        new_checked = st.checkbox(
            "• " + r["part_name"],
            value=checked,
            key=f"part_{part_id}",
        )
        if new_checked != checked:
            update_part_done(part_id, new_checked)
            st.experimental_rerun()

    st.markdown("---")

    # Metrics for the day
    st.subheader("Today’s metrics")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Completion", f"{pct:.1f}%")
    c2.metric("Tasks done", f"{tasks_done} / {len(task_ids)}")
    c3.metric("Parts done", str(done_parts))
    c4.metric("Parts remaining", str(remaining_parts))

    # Timeline of completion during the day
    completed_with_time = [
        r for r in parts if r["is_done"] and r["completed_at"]
    ]
    if completed_with_time:
        timeline_data = []
        completed_with_time_sorted = sorted(
            completed_with_time,
            key=lambda r: r["completed_at"],
        )
        cumulative = 0
        for r in completed_with_time_sorted:
            try:
                dt = datetime.datetime.fromisoformat(r["completed_at"])
            except Exception:
                # Fallback: ignore badly formatted dates
                continue
            cumulative += 1
            completion_pct = (cumulative / total_parts) * 100
            timeline_data.append(
                {
                    "time": dt,
                    "completed_parts": cumulative,
                    "completion_pct": completion_pct,
                }
            )

        if timeline_data:
            df_timeline = pd.DataFrame(timeline_data)
            st.subheader("Progress over time (today)")
            chart = (
                alt.Chart(df_timeline)
                .mark_line(point=True)
                .encode(
                    x=alt.X("time:T", title="Time"),
                    y=alt.Y(
                        "completion_pct",
                        title="Completion %",
                        scale=alt.Scale(domain=[0, 100]),
                    ),
                    tooltip=["time:T", "completed_parts", "completion_pct"],
                )
            )
            st.altair_chart(chart, use_container_width=True)
    else:
        st.info("No completed parts with timestamps yet for a timeline view.")

    # Tabular view for today
    st.subheader("Table view for today")
    data_rows = []
    for r in parts:
        data_rows.append(
            {
                "Project": r["project_name"],
                "Task": r["task_name"],
                "Part": r["part_name"],
                "Done": bool(r["is_done"]),
                "Completed at": r["completed_at"],
            }
        )
    df = pd.DataFrame(data_rows)
    st.dataframe(df, use_container_width=True)


def page_reports():
    st.header("📊 Progress Reports")

    today = datetime.date.today()
    view = st.selectbox(
        "Report range",
        ["Daily", "Weekly", "Monthly", "Yearly"],
    )

    if view == "Daily":
        start = st.date_input("From", today - datetime.timedelta(days=6))
        end = st.date_input("To", today)
    elif view == "Weekly":
        start = today - datetime.timedelta(weeks=12)
        end = today
    elif view == "Monthly":
        start = today - datetime.timedelta(days=365)
        end = today
    else:  # Yearly
        start = today - datetime.timedelta(days=365 * 3)
        end = today

    df_days = get_completion_by_day(start, end)
    if df_days.empty:
        st.info("No data for this range yet.")
        return

    # Aggregate depending on the selected view
    if view == "Daily":
        df_plot = df_days
        x_field = "date"
    elif view == "Weekly":
        df_plot = df_days.copy()
        df_plot["week"] = df_plot["date"].apply(
            lambda d: f"{d.isocalendar().year}-W{d.isocalendar().week:02d}"
        )
        df_plot = df_plot.groupby("week", as_index=False)["completion"].mean()
        x_field = "week"
    elif view == "Monthly":
        df_plot = df_days.copy()
        df_plot["month"] = df_plot["date"].apply(lambda d: d.strftime("%Y-%m"))
        df_plot = df_plot.groupby("month", as_index=False)["completion"].mean()
        x_field = "month"
    else:  # Yearly
        df_plot = df_days.copy()
        df_plot["year"] = df_plot["date"].apply(lambda d: d.year)
        df_plot = df_plot.groupby("year", as_index=False)["completion"].mean()
        x_field = "year"

    chart = (
        alt.Chart(df_plot)
        .mark_line(point=True)
        .encode(
            x=x_field,
            y=alt.Y(
                "completion",
                title="Completion %",
                scale=alt.Scale(domain=[0, 100]),
            ),
            tooltip=[x_field, "completion"],
        )
    )
    st.altair_chart(chart, use_container_width=True)

    avg = df_days["completion"].mean()
    best = df_days["completion"].max()
    streak = compute_streak(df_days, threshold=80)

    st.subheader("Psychology summary")
    col1, col2, col3 = st.columns(3)
    col1.metric("Average completion", f"{avg:.1f}%")
    col2.metric("Best day", f"{best:.1f}%")
    col3.metric("Best ≥80% streak", f"{streak} days")

    st.caption(
        "Reasonable target: keep the average above ~75% and build streaks of at least 5 days. "
        "If you fall off, go back to the rule of 'at least one part per day'."
    )


def page_history():
    st.header("📜 Daily History & Details")

    available_dates = get_existing_dates()
    if not available_dates:
        st.info("No days recorded yet. Start by adding a plan for today.")
        return

    default_date = available_dates[0]
    date = st.date_input("Select a day", value=default_date)
    persian_date = gregorian_to_persian_str(date)
    st.caption(f"Persian date: {persian_date}")

    parts = get_parts_for_date(date)
    if not parts:
        st.warning("No tasks found for this exact day, even though there is nearby data.")
        return

    total = len(parts)
    done = sum(1 for r in parts if r["is_done"])
    pct = (done / total) * 100 if total else 0
    st.subheader(
        f"Summary for {date.isoformat()} "
        f"({pct:.1f}% – {done}/{total} parts done)"
    )

    current_project = None
    current_task = None
    for r in parts:
        proj = r["project_name"]
        task = r["task_name"]
        completed_at = r["completed_at"]

        if proj != current_project:
            st.markdown(f"### 🧭 {proj}")
            current_project = proj
            current_task = None

        if task != current_task:
            st.markdown(f"**🔹 {task}**")
            current_task = task

        status = "✅" if r["is_done"] else "⬜"
        time_str = ""
        if completed_at:
            try:
                dt = datetime.datetime.fromisoformat(completed_at)
                time_str = f" (done at {dt.strftime('%H:%M  %Y-%m-%d')})"
            except Exception:
                time_str = f" (done at {completed_at})"

        st.markdown(f"{status} {r['part_name']}{time_str}")

    st.markdown("---")
    st.subheader("Tabular view for this day")

    data_rows = []
    for r in parts:
        data_rows.append(
            {
                "Project": r["project_name"],
                "Task": r["task_name"],
                "Part": r["part_name"],
                "Done": bool(r["is_done"]),
                "Completed at": r["completed_at"],
            }
        )
    df = pd.DataFrame(data_rows)
    st.dataframe(df, use_container_width=True)


# ---------- MAIN APP ----------

def main():
    st.set_page_config(
        page_title="Deep Focus Planner",
        page_icon="✅",
        layout="wide",
    )
    init_db()

    st.sidebar.title("📚 Personal Planner")

    page = st.sidebar.radio(
        "Go to:",
        (
            "➕ Add daily plan",
            "✅ Daily checklist",
            "📊 Reports",
            "📜 History",
        ),
    )

    st.sidebar.markdown("---")
    st.sidebar.write(
        "Suggested structure:\n"
        "- Main project: Australia, Canada, Linear Algebra, Code\n"
        "- Sub-task: promotion letter, lecture 71, day 1\n"
        "- Parts: 1, 2, 3 or concrete micro-steps"
    )
    if jdatetime is None:
        st.sidebar.warning("For Persian dates install:  pip install jdatetime")

    if page == "➕ Add daily plan":
        page_add_plan()
    elif page == "✅ Daily checklist":
        page_checklist()
    elif page == "📊 Reports":
        page_reports()
    else:
        page_history()


if __name__ == "__main__":
    main()
