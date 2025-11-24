"""
Database helper functions for loading existing plans
"""

from typing import List, Dict
import datetime


def load_plan_for_date(conn, date: datetime.date) -> Dict:
    """
    Load complete plan structure for a specific date.
    Returns: {
        'main_tasks': [
            {
                'name': str,
                'description': str,
                'subtasks': [
                    {
                        'name': str,
                        'parts': [str, str, ...]
                    }
                ]
            }
        ]
    }
    """
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    # Get all projects (Main Tasks) for this date
    c.execute(
        "SELECT DISTINCT name, description FROM project WHERE date = ? ORDER BY order_index",
        (date.isoformat(),)
    )
    projects = c.fetchall()
    
    main_tasks = []
    
    for project in projects:
        main_task = {
            'name': project['name'],
            'description': project.get('description', ''),
            'subtasks': []
        }
        
        # Get all subtasks (tasks) for this main task
        c.execute(
            """
            SELECT t.* FROM task t
            JOIN project p ON t.project_id = p.id
            WHERE p.name = ? AND t.date = ?
            ORDER BY t.order_index
            """,
            (project['name'], date.isoformat())
        )
        subtasks = c.fetchall()
        
        for subtask in subtasks:
            # Get parts for this subtask
            c.execute(
                "SELECT name FROM part WHERE task_id = ? ORDER BY order_index",
                (subtask['id'],)
            )
            parts = [part['name'] for part in c.fetchall()]
            
            main_task['subtasks'].append({
                'name': subtask['name'],
                'parts': ', '.join(parts) if parts else ''
            })
        
        main_tasks.append(main_task)
    
    return {'main_tasks': main_tasks}


def get_all_subtasks_for_date(conn, date: datetime.date) -> List[Dict]:
    """
    Get all subtasks with their main task info for Kanban display.
    Returns list of subtasks with parent main task name.
    """
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    c.execute(
        """
        SELECT 
            t.id as subtask_id,
            t.name as subtask_name,
            t.status,
            p.name as main_task_name
        FROM task t
        JOIN project p ON t.project_id = p.id
        WHERE t.date = ?
        ORDER BY p.order_index, t.order_index
        """,
        (date.isoformat(),)
    )
    
    return c.fetchall()


def get_hierarchical_plan_for_date(conn, date: datetime.date) -> List[Dict]:
    """
    Get complete hierarchical plan: Main Task → Subtasks → Parts
    For Daily Checklist display.
    """
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    # Get all main tasks
    c.execute(
        "SELECT DISTINCT id, name FROM project WHERE date = ? ORDER BY order_index",
        (date.isoformat(),)
    )
    main_tasks = c.fetchall()
    
    result = []
    
    for main_task in main_tasks:
        # Get subtasks
        c.execute(
            "SELECT id, name, status FROM task WHERE project_id = ? ORDER BY order_index",
            (main_task['id'],)
        )
        subtasks = c.fetchall()
        
        subtasks_with_parts = []
        for subtask in subtasks:
            # Get parts
            c.execute(
                "SELECT id, name, status FROM part WHERE task_id = ? ORDER BY order_index",
                (subtask['id'],)
            )
            parts = c.fetchall()
            
            subtasks_with_parts.append({
                'id': subtask['id'],
                'name': subtask['name'],
                'status': subtask['status'],
                'parts': parts
            })
        
        result.append({
            'id': main_task['id'],
            'name': main_task['name'],
            'subtasks': subtasks_with_parts
        })
    
    return result


def update_subtask_status(conn, subtask_id: int, new_status: str):
    """Update status of a subtask."""
    c = conn.cursor()
    c.execute("UPDATE task SET status = ? WHERE id = ?", (new_status, subtask_id))
    conn.commit()


def update_part_status(conn, part_id: int, new_status: str):
    """Update status of a part."""
    c = conn.cursor()
    c.execute("UPDATE part SET status = ? WHERE id = ?", (new_status, part_id))
    
    # Also update is_done for compatibility
    is_done = 1 if new_status == "Done" else 0
    c.execute("UPDATE part SET is_done = ? WHERE id = ?", (is_done, part_id))
    
    conn.commit()
