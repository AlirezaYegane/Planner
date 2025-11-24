"""
🎯 Kanban Board - View Only
Displays Subtasks as cards, grouped by status
All data loaded from database
"""

import streamlit as st
import datetime
from src.database import get_conn
from src.plan_loader import get_all_subtasks_for_date, update_subtask_status
from src.utils import gregorian_to_persian_str
from src.gamification import trigger_celebration
from src.kanban_logic import STATUS_NOT_STARTED, STATUS_DOING, STATUS_DONE, STATUS_POSTPONED, ALL_STATUSES


def page_kanban():
    """Kanban Board - Display subtasks as cards."""
    
    # CSS Styling
    st.markdown("""
    <style>
    .status-column {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 15px;
        min-height: 400px;
    }
    
    .status-header {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 15px;
        padding: 8px;
        border-radius: 8px;
        text-align: center;
        color: white;
    }
    
    .status-not-started { background: #c4c4c4; }
    .status-doing { background: linear-gradient(135deg, #0073ea, #667eea); }
    .status-done { background: linear-gradient(135deg, #00c875, #00d084); }
    .status-postponed { background: linear-gradient(135deg, #e2445c, #ff6b7a); }
    
    .subtask-card {
        background: white;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-left: 4px solid #0073ea;
        transition: all 0.3s ease;
    }
    
    .subtask-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-2px);
    }
    
    .card-subtitle {
        font-size: 12px;
        color: #676879;
        margin-bottom: 5px;
    }
    
    .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #323338;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Header
    st.title("🎯 Kanban Board")
    st.caption("View and manage your subtasks")
    
    # Date selector
    col1, col2 = st.columns([2, 3])
    with col1:
        selected_date = st.date_input("Select Date", value=datetime.date.today())
        st.caption(f"Persian: {gregorian_to_persian_str(selected_date)}")
    
    with col2:
        st.info("💡 Move subtasks between statuses to track progress")
    
    st.markdown("---")
    
    # Load all subtasks for this date
    conn = get_conn()
    all_subtasks = get_all_subtasks_for_date(conn, selected_date)
    conn.close()
    
    if not all_subtasks:
        st.warning("📌 No plan for this date. Go to **Daily Planning Wizard** to create one!")
        return
    
    # Group subtasks by status
    subtasks_by_status = {status: [] for status in ALL_STATUSES}
    for subtask in all_subtasks:
        status = subtask.get('status', STATUS_NOT_STARTED)
        subtasks_by_status[status].append(subtask)
    
    # Render 4 columns for statuses
    cols = st.columns(4)
    headers = ["⭕ Not Started", "⚙️ Doing", "✅ Done", "⏸️ Postponed"]
    
    for idx, (status, header, col) in enumerate(zip(ALL_STATUSES, headers, cols)):
        with col:
            # Column header
            header_class = f"status-{status.lower().replace(' ', '-')}"
            st.markdown(f'<div class="status-header {header_class}">{header}</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="status-column">', unsafe_allow_html=True)
            
            # Render subtask cards in this column
            for subtask in subtasks_by_status[status]:
                render_subtask_card(subtask, selected_date)
            
            st.markdown('</div>', unsafe_allow_html=True)


def render_subtask_card(subtask: dict, date: datetime.date):
    """Render a single subtask card."""
    # Card HTML
    st.markdown(f"""
    <div class="subtask-card">
        <div class="card-subtitle">Main Task: {subtask['main_task_name']}</div>
        <div class="card-title">{subtask['subtask_name']}</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Status selector
    current_status = subtask.get('status', STATUS_NOT_STARTED)
    new_status = st.selectbox(
        "Status",
        ALL_STATUSES,
        index=ALL_STATUSES.index(current_status),
        key=f"subtask_{subtask['subtask_id']}",
        label_visibility="collapsed"
    )
    
    if new_status != current_status:
        # Update in database
        conn = get_conn()
        update_subtask_status(conn, subtask['subtask_id'], new_status)
        conn.close()
        
        # Celebration
        if new_status == STATUS_DONE:
            trigger_celebration("subtask")
        
        st.rerun()
