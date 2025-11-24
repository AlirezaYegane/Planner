"""
Helper functions for deleting existing plans
"""

import datetime


def delete_plan_for_date(conn, date: datetime.date):
    """Delete all data for a specific date to allow fresh edit."""
    c = conn.cursor()
    
    # Get all project IDs for this date
    c.execute("SELECT id FROM project WHERE date = ?", (date.isoformat(),))
    project_ids = [row[0] for row in c.fetchall()]
    
    if not project_ids:
        return  # No plan to delete
    
    # Delete all parts for tasks of these projects
    for proj_id in project_ids:
        c.execute("""
            DELETE FROM part 
            WHERE task_id IN (SELECT id FROM task WHERE project_id = ?)
        """, (proj_id,))
    
    # Delete all tasks for these projects
    for proj_id in project_ids:
        c.execute("DELETE FROM task WHERE project_id = ?", (proj_id,))
    
    # Delete projects
    c.execute("DELETE FROM project WHERE date = ?", (date.isoformat(),))
    
    conn.commit()
