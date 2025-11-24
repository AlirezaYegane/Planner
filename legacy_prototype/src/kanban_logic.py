"""
Core logic for Kanban + Gamified Daily Planner
Progress calculation, postponed tasks, time tracking, and analytics
"""

import datetime
import pandas as pd
from typing import List, Dict, Tuple

# Status constants
STATUS_NOT_STARTED = "Not Started"
STATUS_DOING = "Doing"
STATUS_DONE = "Done"
STATUS_POSTPONED = "Postponed"

ALL_STATUSES = [STATUS_NOT_STARTED, STATUS_DOING, STATUS_DONE, STATUS_POSTPONED]


def calculate_part_progress(status: str) -> float:
    """
    Calculate progress for a single Part.
    Returns: 0.0 to 1.0
    """
    return 1.0 if status == STATUS_DONE else 0.0


def calculate_subtask_progress(parts: List[Dict]) -> float:
    """
    Calculate progress for a Subtask based on its Parts.
    
    Args:
        parts: List of part dictionaries with 'status' field
        
    Returns:
        Progress as 0.0 to 1.0
        - If no parts: based on subtask's own status
        - If has parts: average of parts' progress
    """
    if not parts:
        # No parts - progress is 0% or 100% based on subtask's own status
        return 0.0  # Caller should check subtask status directly
    
    total_progress = sum(calculate_part_progress(p.get("status", STATUS_NOT_STARTED)) for p in parts)
    return total_progress / len(parts)


def calculate_main_topic_progress(subtasks_with_parts: List[Tuple[Dict, List[Dict]]]) -> float:
    """
    Calculate progress for a Main Topic based on its Subtasks.
    
    Args:
        subtasks_with_parts: List of (subtask_dict, parts_list) tuples
        
    Returns:
        Progress as 0.0 to 1.0
    """
    if not subtasks_with_parts:
        return 0.0  # No subtasks means 0% (or check Main Topic's own status)
    
    total_progress = 0.0
    for subtask, parts in subtasks_with_parts:
        if parts:
            # Subtask has parts - use parts' progress
            total_progress += calculate_subtask_progress(parts)
        else:
            # Subtask has no parts - use its own status
            total_progress += calculate_part_progress(subtask.get("status", STATUS_NOT_STARTED))
    
    return total_progress / len(subtasks_with_parts)


def get_postponed_items_before_date(conn, target_date: datetime.date) -> Dict[str, List[Dict]]:
    """
    Find all postponed items from days before target_date.
    
    Returns:
        Dict with keys: 'projects', 'tasks', 'parts'
        Each containing list of postponed items
    """
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    # Postponed Main Topics
    c.execute(
        "SELECT * FROM project WHERE status = ? AND date < ? ORDER BY date DESC",
        (STATUS_POSTPONED, target_date.isoformat())
    )
    projects = c.fetchall()
    
    # Postponed Subtasks
    c.execute(
        "SELECT * FROM task WHERE status = ? AND date < ? ORDER BY date DESC",
        (STATUS_POSTPONED, target_date.isoformat())
    )
    tasks = c.fetchall()
    
    # Postponed Parts
    c.execute(
        """
        SELECT p.* FROM part p
        JOIN task t ON p.task_id = t.id
        WHERE p.status = ? AND t.date < ?
        ORDER BY t.date DESC
        """,
        (STATUS_POSTPONED, target_date.isoformat())
    )
    parts = c.fetchall()
    
    return {
        "projects": projects,
        "tasks": tasks,
        "parts": parts
    }


def calculate_duration_minutes(start_time: str, end_time: str) -> int:
    """
    Calculate duration between start and end times.
    
    Args:
        start_time: ISO format datetime string
        end_time: ISO format datetime string
        
    Returns:
        Duration in minutes
    """
    if not start_time or not end_time:
        return 0
    
    try:
        start_dt = datetime.datetime.fromisoformat(start_time)
        end_dt = datetime.datetime.fromisoformat(end_time)
        delta = end_dt - start_dt
        return int(delta.total_seconds() / 60)
    except:
        return 0


def get_or_create_user_settings(conn, date: datetime.date) -> Dict:
    """
    Get user settings for a specific date, or create with defaults.
    
    Returns:
        Dict with sleep_start_time, wake_up_time, commute_minutes_total
    """
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    c.execute("SELECT * FROM user_settings WHERE date = ?", (date.isoformat(),))
    settings = c.fetchone()
    
    if not settings:
        # Create default settings
        c.execute(
            """
            INSERT INTO user_settings (date, sleep_start_time, wake_up_time, commute_minutes_total, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (date.isoformat(), "23:00", "07:00", 60, datetime.datetime.now().isoformat())
        )
        conn.commit()
        c.execute("SELECT * FROM user_settings WHERE date = ?", (date.isoformat(),))
        settings = c.fetchone()
    
    return settings


def calculate_available_time_minutes(sleep_start: str, wake_time: str, commute_minutes: int) -> int:
    """
    Calculate available awake & non-commute time in minutes.
    
    Args:
        sleep_start: HH:MM format (e.g., "23:00")
        wake_time: HH:MM format (e.g., "07:00")
        commute_minutes: Total commute time
        
    Returns:
        Available minutes in the day
    """
    try:
        # Parse times
        sleep_h, sleep_m = map(int, sleep_start.split(":"))
        wake_h, wake_m = map(int, wake_time.split(":"))
        
        # Calculate awake hours (assuming sleep overnight)
        if wake_h < sleep_h:
            # Normal case: wake in morning, sleep at night
            awake_minutes = ((24 - sleep_h) * 60 - sleep_m) + (wake_h * 60 + wake_m)
        else:
            # Edge case: wake is later than sleep (unusual but possible)
            awake_minutes = (wake_h - sleep_h) * 60 + (wake_m - sleep_m)
        
        # Subtract commute
        available = awake_minutes - commute_minutes
        return max(0, available)
    except:
        # Default: assume 16 hours awake minus commute
        return max(0, 16 * 60 - commute_minutes)


def calculate_daily_time_stats(conn, date: datetime.date) -> Dict:
    """
    Calculate time statistics for a day.
    
    Returns:
        Dict with:
        - available_minutes: Total time available
        - task_minutes: Time spent on tasks
        - wasted_minutes: Unallocated time
        - sleep_minutes: Time sleeping
        - commute_minutes: Time commuting
    """
    settings = get_or_create_user_settings(conn, date)
    
    # Calculate available time
    available_minutes = calculate_available_time_minutes(
        settings["sleep_start_time"],
        settings["wake_up_time"],
        settings["commute_minutes_total"]
    )
    
    # Sum up actual task time
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    c.execute(
        "SELECT SUM(duration_minutes) as total FROM task WHERE date = ? AND duration_minutes IS NOT NULL",
        (date.isoformat(),)
    )
    task_result = c.fetchone()
    task_minutes = task_result["total"] if task_result and task_result["total"] else 0
    
    c.execute(
        """
        SELECT SUM(p.duration_minutes) as total
        FROM part p
        JOIN task t ON p.task_id = t.id
        WHERE t.date = ? AND p.duration_minutes IS NOT NULL
        """,
        (date.isoformat(),)
    )
    part_result = c.fetchone()
    part_minutes = part_result["total"] if part_result and part_result["total"] else 0
    
    total_task_minutes = task_minutes + part_minutes
    wasted_minutes = max(0, available_minutes - total_task_minutes)
    
    # Calculate sleep time
    try:
        sleep_h, sleep_m = map(int, settings["sleep_start_time"].split(":"))
        wake_h, wake_m = map(int, settings["wake_up_time"].split(":"))
        sleep_minutes = 24 * 60 - ((wake_h * 60 + wake_m) + (24 - sleep_h) * 60 - sleep_m)
    except:
        sleep_minutes = 8 * 60  # Default 8 hours
    
    return {
        "available_minutes": available_minutes,
        "task_minutes": total_task_minutes,
        "wasted_minutes": wasted_minutes,
        "sleep_minutes": sleep_minutes,
        "commute_minutes": settings["commute_minutes_total"]
    }


def format_minutes_to_hours(minutes: int) -> str:
    """Convert minutes to human-readable hours format."""
    if minutes < 60:
        return f"{minutes}m"
    hours = minutes / 60
    if hours == int(hours):
        return f"{int(hours)}h"
    return f"{hours:.1f}h"
