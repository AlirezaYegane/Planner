import streamlit as st
import pandas as pd
import datetime
from src.database import (
    get_all_boards, create_board, get_groups_for_board, create_group,
    get_tasks_for_group, create_task_in_group, update_task_status, 
    update_task_priority, update_task_name, update_task_date, delete_task, get_conn
)

# Monday.com style constants
STATUS_OPTIONS = ["Done", "Working on it", "Stuck", "Not Started"]
PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"]

STATUS_COLORS = {
    "Done": "#00c875",  # Green
    "Working on it": "#fdab3d",  # Orange  
    "Stuck": "#e2445c",  # Red
    "Not Started": "#c4c4c4"  # Grey
}

PRIORITY_COLORS = {
    "Critical": "#401694",  # Dark Purple
    "High": "#e2445c",  # Red
    "Medium": "#fdab3d",  # Orange
    "Low": "#579bfc"  # Blue
}


def render_board_view():
    # Apply Monday.com-like styling
    st.markdown("""
    <style>
    /* Monday.com theme colors */
    :root {
        --monday-blue: #0073ea;
        --monday-dark-blue: #0060b9;
        --monday-light-grey: #f6f7fb;
        --monday-border: #d0d4e4;
    }
    
    /* Main header styling */
    .main-header {
        font-size: 28px;
        font-weight: 400;
        color: #323338;
        margin-bottom: 20px;
    }
    
    /* Group header styling */
    .group-header {
        background: linear-gradient(90deg, #0073ea 0%, #0060b9 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        margin: 20px 0 10px 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    /* Data editor styling */
    [data-testid="stDataFrame"] {
        border: 1px solid var(--monday-border);
        border-radius: 8px;
    }
    
    /* Button styling */
    .stButton>button {
        background-color: var(--monday-blue);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-weight: 500;
    }
    
    .stButton>button:hover {
        background-color: var(--monday-dark-blue);
    }
    </style>
    """, unsafe_allow_html=True)
    
    st.markdown('<div class="main-header">📋 Work Management</div>', unsafe_allow_html=True)

    # Board Selection
    boards = get_all_boards()
    if not boards:
        st.info("🎯 Welcome! Create your first board to get started.")
        col1, col2 = st.columns([3, 1])
        with col1:
            new_board = st.text_input("Board Name", placeholder="e.g., Marketing, Product, Q1 Goals")
        with col2:
            st.write("")  # Spacing
            st.write("")  # Spacing
            if st.button("Create Board", type="primary"):
                if new_board:
                    create_board(new_board)
                    st.rerun()
        return

    board_names = [b["name"] for b in boards]
    
    # Board selector in sidebar
    with st.sidebar:
        st.markdown("### 📊 Boards")
        selected_board_name = st.selectbox("", board_names, label_visibility="collapsed")
        
        st.markdown("---")
        st.markdown("### ➕ Quick Actions")
        if st.button("New Board"):
            st.session_state.create_board_modal = True
    
    selected_board = next(b for b in boards if b["name"] == selected_board_name)
    
    # Board header with action buttons
    col1, col2, col3 = st.columns([3, 1, 1])
    with col1:
        st.markdown(f'<h2 style="color: #323338; margin: 0;">{selected_board_name}</h2>', unsafe_allow_html=True)
    with col2:
        if st.button("➕ New Group"):
            st.session_state.show_group_form = not st.session_state.get("show_group_form", False)
    with col3:
        if st.button("⚙️ Settings"):
            st.info("Settings coming soon!")
    
    # New group form
    if st.session_state.get("show_group_form", False):
        with st.form("new_group_form"):
            st.markdown("#### Add New Group")
            col1, col2 = st.columns([3, 1])
            with col1:
                new_group_name = st.text_input("Group Name", placeholder="e.g., This Week, Backlog, In Progress")
            with col2:
                st.write("")
                st.write("")
                submitted = st.form_submit_button("Add", type="primary")
            if submitted and new_group_name:
                create_group(selected_board["id"], new_group_name)
                st.session_state.show_group_form = False
                st.rerun()

    # Groups
    groups = get_groups_for_board(selected_board["id"])
    
    if not groups:
        st.warning("📁 This board has no groups yet. Click 'New Group' to add one!")
        return

    # Render each group
    for group in groups:
        st.markdown(f'<div class="group-header">📂 {group["name"]}</div>', unsafe_allow_html=True)
        
        # Fetch tasks
        tasks = get_tasks_for_group(group["id"])
        
        # Prepare DataFrame
        df_data = []
        for task in tasks:
            df_data.append({
                "id": task["id"],
                "Item": task["name"],
                "Person": task.get("person", ""),
                "Status": task.get("status", "Not Started"),
                "Priority": task.get("priority", "Medium"),
                "Date": task.get("date", ""),
            })
        
        if df_data:
            df = pd.DataFrame(df_data)
        else:
            df = pd.DataFrame(columns=["id", "Item", "Person", "Status", "Priority", "Date"])
        
        # Data Editor with Monday.com-style configuration
        edited_df = st.data_editor(
            df,
            key=f"editor_{group['id']}",
            num_rows="dynamic",
            use_container_width=True,
            column_config={
                "id": None,  # Hide ID column
                "Item": st.column_config.TextColumn(
                    "Item",
                    width="large",
                    required=True,
                    help="Task name"
                ),
                "Person": st.column_config.TextColumn(
                    "Person",
                    width="medium",
                    help="Assignee name"
                ),
                "Status": st.column_config.SelectboxColumn(
                    "Status",
                    options=STATUS_OPTIONS,
                    required=True,
                    default="Not Started",
                    width="medium",
                ),
                "Priority": st.column_config.SelectboxColumn(
                    "Priority",
                    options=PRIORITY_OPTIONS,
                    required=True,
                    default="Medium",
                    width="medium",
                ),
                "Date": st.column_config.DateColumn(
                    "Date",
                    width="medium",
                    help="Due date"
                ),
            },
            hide_index=True,
        )
        
        # Auto-save button (Monday.com style)
        if st.button(f"💾 Save {group['name']}", key=f"save_{group['id']}", type="primary"):
            # Handle updates and additions
            for index, row in edited_df.iterrows():
                task_id = row.get("id")
                if pd.isna(task_id):
                    # New task
                    date_val = row.get("Date")
                    if pd.notna(date_val) and date_val != "":
                        # Convert to datetime.date if needed
                        if isinstance(date_val, str):
                            date_val = datetime.datetime.fromisoformat(date_val).date()
                        elif isinstance(date_val, pd.Timestamp):
                            date_val = date_val.date()
                    else:
                        date_val = None
                    
                    create_task_in_group(group["id"], row["Item"], date_val)
                else:
                    # Update existing task
                    update_task_name(int(task_id), row["Item"])
                    update_task_status(int(task_id), row["Status"])
                    update_task_priority(int(task_id), row["Priority"])
                    
                    date_val = row.get("Date")
                    if pd.notna(date_val) and date_val != "":
                        if isinstance(date_val, str):
                            date_val = datetime.datetime.fromisoformat(date_val).date()
                        elif isinstance(date_val, pd.Timestamp):
                            date_val = date_val.date()
                        update_task_date(int(task_id), date_val)
            
            # Handle deletions
            if not df.empty:
                existing_ids = set(df["id"].dropna().astype(int))
                current_ids = set(edited_df["id"].dropna().astype(int))
                deleted_ids = existing_ids - current_ids
                
                for tid in deleted_ids:
                    delete_task(tid)
            
            st.success("✅ Changes saved successfully!")
            st.rerun()
        
        st.markdown("---")

    # New board modal
    if st.session_state.get("create_board_modal", False):
        with st.form("new_board_form"):
            st.markdown("#### Create New Board")
            new_board_name = st.text_input("Board Name")
            submitted = st.form_submit_button("Create")
            if submitted and new_board_name:
                create_board(new_board_name)
                st.session_state.create_board_modal = False
                st.rerun()
