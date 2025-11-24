"""
✅ Daily Checklist - View Only
Hierarchical view: Main Task → Subtasks → Parts
All data loaded from database
"""

import streamlit as st
import datetime
from typing import Dict, List
from src.database import get_conn
from src.plan_loader import get_hierarchical_plan_for_date, update_part_status
from src.utils import gregorian_to_persian_str
from src.gamification import trigger_celebration
from src.kanban_logic import STATUS_DONE


def page_checklist():
    """Daily Checklist - Hierarchical view with tickboxes."""
    
    # CSS
    st.markdown("""
    <style>
    .main-task-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-size: 20px;
        font-weight: 700;
        margin: 15px 0;
    }
    
    .subtask-header {
        background: #f6f7fb;
        padding: 10px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        margin: 10px 0;
        border-left: 4px solid #0073ea;
    }
    
    .part-item {
        padding: 5px 0;
        margin-left: 20px;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Header
    st.title("✅ Daily Checklist")
    st.caption("Tick off your tasks as you complete them")
    
    # Date selector
    col1, col2 = st.columns([2, 3])
    with col1:
        selected_date = st.date_input("Select Date", value=datetime.date.today())
        st.caption(f"Persian: {gregorian_to_persian_str(selected_date)}")
    
    with col2:
        st.info("📋 Expand Main Tasks to see Subtasks and Parts")
    
    st.markdown("---")
    
    # Load hierarchical plan
    conn = get_conn()
    plan = get_hierarchical_plan_for_date(conn, selected_date)
    conn.close()
    
    if not plan:
        st.warning("📌 No plan for this date. Go to **Daily Planning Wizard** to create one!")
        return
    
    # Calculate overall progress
    total_parts = sum(len(st['parts']) for mt in plan for st in mt['subtasks'])
    done_parts = sum(1 for mt in plan for st in mt['subtasks'] for p in st['parts'] if p.get('status') == STATUS_DONE)
    
    if total_parts > 0:
        progress_pct = (done_parts / total_parts) * 100
        st.progress(progress_pct / 100)
        st.subheader(f"Overall Progress: {progress_pct:.0f}% ({done_parts}/{total_parts} parts)")
    
    st.markdown("---")
    
    # Render hierarchical structure
    for main_task in plan:
        render_main_task(main_task)


def render_main_task(main_task: dict):
    """Render a Main Task with its subtasks."""
    st.markdown(f'<div class="main-task-header">🎯 {main_task["name"]}</div>', unsafe_allow_html=True)
    
    with st.expander("Show Subtasks", expanded=True):
        if not main_task['subtasks']:
            st.caption("No subtasks")
            return
        
        for subtask in main_task['subtasks']:
            render_subtask(subtask)


def render_subtask(subtask: dict):
    """Render a Subtask with its parts."""
    # Subtask header
    parts = subtask.get('parts', [])
    done_count = sum(1 for p in parts if p.get('status') == STATUS_DONE)
    total_count = len(parts)
    progress = (done_count / total_count * 100) if total_count > 0 else 0
    
    st.markdown(f'<div class="subtask-header">🔹 {subtask["name"]} [{progress:.0f}%]</div>', unsafe_allow_html=True)
    
    # Parts
    if parts:
        for part in parts:
            render_part(part)
    else:
        st.caption("No parts")


def render_part(part: dict):
    """Render a Part with checkbox."""
    is_done = part.get('status') == STATUS_DONE
    
    checked = st.checkbox(
        f"• {part['name']}",
        value=is_done,
        key=f"part_{part['id']}"
    )
    
    if checked != is_done:
        # Update status
        new_status = STATUS_DONE if checked else "Not Started"
        conn = get_conn()
        update_part_status(conn, part['id'], new_status)
        conn.close()
        
        if checked:
            trigger_celebration("part")
        
        st.rerun()
