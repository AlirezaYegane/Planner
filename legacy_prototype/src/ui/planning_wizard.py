"""
📌 Daily Planning Wizard
Single entry point for all planning data creation
Professional naming: MainTask → SubTask → TaskPart
"""

import streamlit as st
import datetime
from typing import List, Dict
from src.database import add_task_with_parts, get_conn
from src.utils import gregorian_to_persian_str
from src.gamification import get_motivational_quote, trigger_celebration


def page_planning_wizard():
    """Daily Planning Wizard - ONLY input page for creating plans."""
    
    # Modern CSS
    st.markdown("""
    <style>
    .wizard-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        border-radius: 15px;
        color: white;
        margin-bottom: 20px;
    }
    
    .wizard-title {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 10px;
    }
    
    .wizard-subtitle {
        font-size: 16px;
        opacity: 0.9;
    }
    
    .step-container {
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin: 20px 0;
    }
    
    .step-header {
        font-size: 20px;
        font-weight: 600;
        color: #323338;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #0073ea;
    }
    
    .task-card {
        background: #f6f7fb;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border-left: 4px solid #0073ea;
    }
    
    .summary-box {
        background: #e3f2fd;
        padding: 20px;
        border-radius: 10px;
        margin: 15px 0;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Initialize wizard state
    if "wizard_step" not in st.session_state:
        st.session_state.wizard_step = 1
    if "planning_day" not in st.session_state:
        st.session_state.planning_day = datetime.date.today()
    if "main_tasks" not in st.session_state:
        st.session_state.main_tasks = []
    
    # CRITICAL FIX: Load existing plan for selected date on page load
    # This ensures data persists after refresh
    if "plan_loaded_for_date" not in st.session_state:
        st.session_state.plan_loaded_for_date = None
    
    # Auto-load plan if we haven't loaded it yet for this date
    if st.session_state.plan_loaded_for_date != st.session_state.planning_day:
        load_existing_plan_for_date(st.session_state.planning_day)
        st.session_state.plan_loaded_for_date = st.session_state.planning_day
    
    # Header
    st.markdown("""
    <div class="wizard-container">
        <div class="wizard-title">📌 Daily Planning Wizard</div>
        <div class="wizard-subtitle">Let's plan your day step by step</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Progress indicator
    st.progress(st.session_state.wizard_step / 4)
    st.caption(f"Step {st.session_state.wizard_step} of 4")
    
    # Render current step
    if st.session_state.wizard_step == 1:
        step_select_date()
    elif st.session_state.wizard_step == 2:
        step_define_main_tasks()
    elif st.session_state.wizard_step == 3:
        step_define_subtasks()
    elif st.session_state.wizard_step == 4:
        step_review_and_save()


def step_select_date():
    """Step 1: Select planning day."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">📆 Step 1: Select Your Planning Day</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 3])
    
    with col1:
        selected_date = st.date_input(
            "Choose date",
            value=st.session_state.planning_day,
            label_visibility="collapsed"
        )
        
        # Check if date changed - load existing plan if it exists
        if selected_date != st.session_state.planning_day:
            st.session_state.planning_day = selected_date
            load_existing_plan_for_date(selected_date)
        
        persian_date = gregorian_to_persian_str(selected_date)
        st.caption(f"Persian: {persian_date}")
        
        # Show if plan exists for this date
        from src.database import get_conn
        from src.plan_loader import load_plan_for_date
        conn = get_conn()
        existing_plan = load_plan_for_date(conn, selected_date)
        conn.close()
        
        if existing_plan['main_tasks']:
            st.info(f"✏️ Plan exists for this date ({len(existing_plan['main_tasks'])} tasks). You can edit it!")
        else:
            st.success("📝 No plan for this date yet. Create a new one!")
    
    with col2:
        st.info(f"💫 _{get_motivational_quote()}_")
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Navigation
    if st.button("Next: Define Main Tasks →", type="primary", use_container_width=True):
        st.session_state.wizard_step = 2
        st.rerun()


def load_existing_plan_for_date(date: datetime.date):
    """Load existing plan from database into wizard state for editing."""
    import streamlit as st
    from src.database import get_conn
    from src.plan_loader import load_plan_for_date
    
    conn = get_conn()
    plan_data = load_plan_for_date(conn, date)
    conn.close()
    
    if plan_data['main_tasks']:
        # Convert loaded data to wizard format
        main_tasks = []
        for mt in plan_data['main_tasks']:
            subtasks = []
            for subtask_data in mt['subtasks']:
                subtasks.append({
                    'name': subtask_data['name'],
                    'parts': subtask_data['parts']
                })
            
            main_tasks.append({
                'name': mt['name'],
                'description': mt['description'],
                'num_subtasks': len(subtasks),
                'subtasks': subtasks
            })
        
        st.session_state.main_tasks = main_tasks
    else:
        # No existing plan - start fresh
        st.session_state.main_tasks = []
    
    # Mark that we've loaded data for this date
    st.session_state.plan_loaded_for_date = date


def step_define_main_tasks():
    """Step 2: Define Main Tasks."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">🎯 Step 2: What Are Your Main Tasks Today?</div>', unsafe_allow_html=True)
    
    st.caption("Define your main areas of focus for the day")
    
    # Display existing main tasks
    for idx, task in enumerate(st.session_state.main_tasks):
        with st.expander(f"Main Task {idx + 1}: {task.get('name', 'Untitled')}", expanded=False):
            col1, col2 = st.columns([3, 1])
            
            with col1:
                task['name'] = st.text_input(
                    "Task Name",
                    value=task.get('name', ''),
                    key=f"main_task_name_{idx}",
                    placeholder="e.g., Study Linear Algebra"
                )
                
                task['description'] = st.text_area(
                    "Description (optional)",
                    value=task.get('description', ''),
                    key=f"main_task_desc_{idx}",
                    placeholder="Brief description..."
                )
                
                task['num_subtasks'] = st.number_input(
                    "Number of Subtasks",
                    min_value=1,
                    max_value=20,
                    value=task.get('num_subtasks', 1),
                    key=f"main_task_subtasks_{idx}"
                )
            
            with col2:
                if st.button("🗑️ Remove", key=f"del_main_{idx}"):
                    st.session_state.main_tasks.pop(idx)
                    st.rerun()
    
    # Add new task button
    if st.button("➕ Add Main Task", use_container_width=True):
        st.session_state.main_tasks.append({
            'name': '',
            'description': '',
            'num_subtasks': 1,
            'subtasks': []
        })
        st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Navigation
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back", use_container_width=True):
            st.session_state.wizard_step = 1
            st.rerun()
    with col2:
        if st.button("Next: Define Subtasks →", type="primary", use_container_width=True):
            if any(t.get('name') for t in st.session_state.main_tasks):
                st.session_state.wizard_step = 3
                st.rerun()
            else:
                st.error("Please add at least one Main Task!")


def step_define_subtasks():
    """Step 3: Define Subtasks and TaskParts for each Main Task."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">📋 Step 3: Define Subtasks & Parts</div>', unsafe_allow_html=True)
    
    for main_idx, main_task in enumerate(st.session_state.main_tasks):
        if not main_task.get('name'):
            continue
        
        st.markdown(f"### 🎯 {main_task['name']}")
        
        # Initialize subtasks if needed
        if 'subtasks' not in main_task:
            main_task['subtasks'] = []
        
        num_subtasks = main_task.get('num_subtasks', 1)
        
        # Ensure we have the right number of subtasks
        while len(main_task['subtasks']) < num_subtasks:
            main_task['subtasks'].append({'name': '', 'parts': ''})
        while len(main_task['subtasks']) > num_subtasks:
            main_task['subtasks'].pop()
        
        # Subtask inputs
        for sub_idx in range(num_subtasks):
            subtask = main_task['subtasks'][sub_idx]
            
            col1, col2 = st.columns(2)
            with col1:
                subtask['name'] = st.text_input(
                    f"Subtask {sub_idx + 1}",
                    value=subtask.get('name', ''),
                    key=f"subtask_{main_idx}_{sub_idx}",
                    placeholder="e.g., Lecture 5"
                )
            
            with col2:
                subtask['parts'] = st.text_input(
                    "Parts (comma-separated)",
                    value=subtask.get('parts', ''),
                    key=f"parts_{main_idx}_{sub_idx}",
                    placeholder="e.g., Exercise 1, Exercise 2, Review"
                )
        
        st.markdown("---")
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Navigation
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back", use_container_width=True):
            st.session_state.wizard_step = 2
            st.rerun()
    with col2:
        if st.button("Next: Review & Save →", type="primary", use_container_width=True):
            st.session_state.wizard_step = 4
            st.rerun()


def step_review_and_save():
    """Step 4: Review and save the complete plan."""
    st.markdown('<div class="step-container">', unsafe_allow_html=True)
    st.markdown('<div class="step-header">📋 Step 4: Review Your Plan</div>', unsafe_allow_html=True)
    
    st.markdown(f"**Planning Day:** {st.session_state.planning_day.isoformat()}")
    st.markdown(f"**Persian Date:** {gregorian_to_persian_str(st.session_state.planning_day)}")
    
    st.markdown("---")
    
    # Display summary
    total_subtasks = 0
    total_parts = 0
    
    for main_task in st.session_state.main_tasks:
        if not main_task.get('name'):
            continue
        
        st.markdown(f"### 🎯 {main_task['name']}")
        if main_task.get('description'):
            st.caption(main_task['description'])
        
        for subtask in main_task.get('subtasks', []):
            if subtask.get('name'):
                total_subtasks += 1
                parts_list = [p.strip() for p in subtask.get('parts', '').split(',') if p.strip()]
                total_parts += len(parts_list) if parts_list else 1
                st.markdown(f"- **{subtask['name']}** ({len(parts_list) if parts_list else 1} parts)")
        
        st.markdown("---")
    
    # Summary box
    st.markdown(f"""
    <div class="summary-box">
        <strong>📊 Plan Summary:</strong><br>
        ✓ {len([t for t in st.session_state.main_tasks if t.get('name')])} Main Tasks<br>
        ✓ {total_subtasks} Subtasks<br>
        ✓ {total_parts} Task Parts
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Navigation
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back to Edit", use_container_width=True):
            st.session_state.wizard_step = 3
            st.rerun()
    with col2:
        if st.button("💾 Save My Plan", type="primary", use_container_width=True):
            save_user_plan()


def save_user_plan():
    """Save the complete user plan to database."""
    import streamlit as st
    from src.database import get_conn, add_task_with_parts
    from src.plan_deleter import delete_plan_for_date
    
    planning_day = st.session_state.planning_day
    
    # CRITICAL: Delete existing plan for this date first
    # This ensures we only have ONE plan per day (edit, not duplicate)
    conn = get_conn()
    delete_plan_for_date(conn, planning_day)
    conn.close()
    
    saved_count = 0
    
    for main_task in st.session_state.main_tasks:
        main_task_name = main_task.get('name', '').strip()
        if not main_task_name:
            continue
        
        for subtask in main_task.get('subtasks', []):
            subtask_name = subtask.get('name', '').strip()
            if not subtask_name:
                continue
            
            # Parse parts
            parts_text = subtask.get('parts', '').strip()
            if parts_text:
                parts_list = [p.strip() for p in parts_text.split(',') if p.strip()]
            else:
                parts_list = ['Done']  # Default part
            
            # Save to database
            add_task_with_parts(main_task_name, planning_day, subtask_name, parts_list)
            saved_count += 1
    
    if saved_count > 0:
        st.success(f"✅ Successfully saved {saved_count} items for {planning_day.isoformat()}!")
        st.balloons()
        trigger_celebration("main_topic")
        
        # Don't reset wizard state - keep data for further editing
        st.info("📌 Your plan is saved! You can continue editing or navigate to 🎯 Kanban Board or ✅ Daily Checklist")
    else:
        st.error("⚠️ No tasks to save. Please add at least one Main Task with Subtasks.")
