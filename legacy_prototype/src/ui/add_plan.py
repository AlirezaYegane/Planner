"""
Enhanced Plan Your Day Page
Card-based UI with status columns - PRESERVES existing logic
"""

import datetime
import streamlit as st
from src.database import add_task_with_parts, get_conn
from src.utils import gregorian_to_persian_str
from src.gamification import get_motivational_quote, trigger_celebration
from src.kanban_logic import STATUS_NOT_STARTED, STATUS_DOING, STATUS_DONE, STATUS_POSTPONED, ALL_STATUSES


def page_add_plan():
    """Enhanced daily planning page with card-based UI."""
    
    # Modern CSS styling
    st.markdown("""
    <style>
    /* Status Column Styling */
    .status-column {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 15px;
        min-height: 400px;
        border: 2px dashed #e0e0e0;
    }
    
    .status-header {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 15px;
        padding: 8px;
        border-radius: 8px;
        text-align: center;
    }
    
    .status-not-started { background: #c4c4c4; color: white; }
    .status-doing { background: linear-gradient(135deg, #0073ea, #667eea); color: white; }
    .status-done { background: linear-gradient(135deg, #00c875, #00d084); color: white; }
    .status-postponed { background: linear-gradient(135deg, #e2445c, #ff6b7a); color: white; }
    
    /* Card Styling */
    .task-card {
        background: white;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-left: 4px solid #0073ea;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .task-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-2px);
    }
    
    .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #323338;
        margin-bottom: 8px;
    }
    
    .card-subtitle {
        font-size: 13px;
        color: #676879;
        margin-bottom: 5px;
    }
    
    .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        margin: 3px;
    }
    
    .badge-subtasks { background: #e3f2fd; color: #1976d2; }
    .badge-parts { background: #f3e5f5; color: #7b1fa2; }
    
    /* Add Item Button */
    .add-btn {
        width: 100%;
        padding: 12px;
        border: 2px dashed #0073ea;
        border-radius: 8px;
        background: transparent;
        color: #0073ea;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .add-btn:hover {
        background: #e3f2fd;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Header
    st.title("📅 Plan Your Day")
    
    # Date and motivation
    col1, col2 = st.columns([2, 3])
    with col1:
        today = datetime.date.today()
        date = st.date_input("📆 Date", value=today)
        st.caption(f"Persian: {gregorian_to_persian_str(date)}")
    with col2:
        st.info(f"💫 _{get_motivational_quote()}_")
    
    st.markdown("---")
    
    # Initialize session state
    if "planning_items" not in st.session_state:
        st.session_state.planning_items = {
            STATUS_NOT_STARTED: [],
            STATUS_DOING: [],
            STATUS_DONE: [],
            STATUS_POSTPONED: []
        }
    
    # Instructions
    with st.expander("ℹ️ How to Use", expanded=False):
        st.markdown("""
        **Plan your day with cards:**
        1. Add items using the "+" button in any status column
        2. Each item can have Main Title → Subtasks → Parts
        3. Move items between status columns as you plan
        4. Click "Save All" when done
        """)
    
    # Render status columns
    st.markdown("### 🎯 Your Planning Board")
    cols = st.columns(4)
    
    for idx, (status, col) in enumerate(zip(ALL_STATUSES, cols)):
        with col:
            render_status_column(status, date)
    
    # Save button
    st.markdown("---")
    if st.button("💾 Save All Items for Today", type="primary", use_container_width=True):
        save_all_items(date)


def render_status_column(status: str, date: datetime.date):
    """Render a status column with cards."""
    # Column header
    header_class = f"status-{status.lower().replace(' ', '-')}"
    icon = get_status_icon(status)
    st.markdown(f'<div class="status-header {header_class}">{icon} {status}</div>', unsafe_allow_html=True)
    
    # Get items for this status
    items = st.session_state.planning_items.get(status, [])
    
    # Render cards
    for idx, item in enumerate(items):
        render_item_card(item, status, idx)
    
    # Add item button
    if st.button(f"➕ Add Item", key=f"add_{status}", use_container_width=True):
        show_add_item_form(status)


def render_item_card(item: dict, status: str, idx: int):
    """Render a single item card."""
    with st.container():
        # Card
        st.markdown(f"""
        <div class="task-card">
            <div class="card-title">{item.get('title', 'Untitled')}</div>
            <div class="card-subtitle">{item.get('description', '')[:50]}...</div>
            <div>
                <span class="badge badge-subtasks">{len(item.get('subtasks', []))} subtasks</span>
                <span class="badge badge-parts">{sum(len(s.get('parts', [])) for s in item.get('subtasks', []))} parts</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Actions
        col1, col2, col3 = st.columns(3)
        with col1:
            if st.button("📝", key=f"edit_{status}_{idx}", help="Edit"):
                st.session_state.editing_item = (status, idx)
        with col2:
            # Move to different status
            new_status = st.selectbox(
                "Move",
                ALL_STATUSES,
                index=ALL_STATUSES.index(status),
                key=f"move_{status}_{idx}",
                label_visibility="collapsed"
            )
            if new_status != status:
                move_item(status, idx, new_status)
                st.rerun()
        with col3:
            if st.button("🗑️", key=f"del_{status}_{idx}", help="Delete"):
                st.session_state.planning_items[status].pop(idx)
                st.rerun()


def show_add_item_form(status: str):
    """Show form to add new item."""
    st.session_state.show_form_for_status = status
    
    with st.form(f"add_form_{status}"):
        st.markdown("#### Add New Item")
        
        title = st.text_input("Main Title", placeholder="e.g., Study Linear Algebra")
        description = st.text_area("Description (optional)", placeholder="Brief description...")
        
        # Subtasks
        st.markdown("**Subtasks & Parts:**")
        num_subtasks = st.number_input("Number of subtasks", min_value=0, max_value=10, value=1)
        
        subtasks = []
        for i in range(num_subtasks):
            col1, col2 = st.columns(2)
            with col1:
                subtask_name = st.text_input(f"Subtask {i+1}", key=f"sub_{i}")
            with col2:
                parts_text = st.text_input(f"Parts (comma-separated)", key=f"parts_{i}")
            
            if subtask_name:
                parts = [p.strip() for p in parts_text.split(",") if p.strip()] if parts_text else ["Done"]
                subtasks.append({"name": subtask_name, "parts": parts})
        
        submitted = st.form_submit_button("Add Item", type="primary")
        
        if submitted and title:
            new_item = {
                "title": title,
                "description": description,
                "subtasks": subtasks
            }
            st.session_state.planning_items[status].append(new_item)
            trigger_celebration("part")
            st.rerun()


def move_item(from_status: str, idx: int, to_status: str):
    """Move item between statuses."""
    item = st.session_state.planning_items[from_status].pop(idx)
    st.session_state.planning_items[to_status].append(item)
    trigger_celebration("part")


def save_all_items(date: datetime.date):
    """Save all planning items to database."""
    saved_count = 0
    
    for status, items in st.session_state.planning_items.items():
        for item in items:
            title = item.get("title", "")
            if not title:
                continue
            
            subtasks = item.get("subtasks", [])
            if subtasks:
                for subtask in subtasks:
                    name = subtask.get("name", "")
                    parts = subtask.get("parts", ["Done"])
                    if name:
                        add_task_with_parts(title, date, name, parts)
                        saved_count += 1
            else:
                # No subtasks - add title as task
                add_task_with_parts(title, date, title, ["Done"])
                saved_count += 1
    
    if saved_count > 0:
        st.success(f"✅ Saved {saved_count} items for {date.isoformat()}!")
        st.balloons()
        # Reset
        st.session_state.planning_items = {
            STATUS_NOT_STARTED: [],
            STATUS_DOING: [],
            STATUS_DONE: [],
            STATUS_POSTPONED: []
        }
        st.rerun()
    else:
        st.error("⚠️ No items to save. Add some items first!")


def get_status_icon(status: str) -> str:
    """Get icon for status."""
    icons = {
        STATUS_NOT_STARTED: "⭕",
        STATUS_DOING: "⚙️",
        STATUS_DONE: "✅",
        STATUS_POSTPONED: "⏸️"
    }
    return icons.get(status, "")
