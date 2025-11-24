"""
Main Topic Summary Page
Dashboard view showing all Main Topics with metrics and time-based sorting
"""

import streamlit as st
import datetime
from typing import List, Dict
from src.database import get_conn, get_completion_by_day
from src.kanban_logic import STATUS_DONE, format_minutes_to_hours
from src.utils import gregorian_to_persian_str


def page_topic_summary():
    """Main Topic Summary dashboard."""
    
    # CSS Styling
    st.markdown("""
    <style>
    .summary-card {
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        border-bottom: 5px solid #0073ea;
        height: 100%;
    }
    
    .summary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    
    .topic-name {
        font-size: 20px;
        font-weight: 700;
        color: #323338;
        margin-bottom: 15px;
    }
    
    .metric-row {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        padding: 8px;
        background: #f6f7fb;
        border-radius: 8px;
    }
    
    .metric-label {
        font-size: 13px;
        color: #676879;
    }
    
    .metric-value {
        font-size: 15px;
        font-weight: 600;
        color: #323338;
    }
    
    .time-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: 700;
        margin: 10px 0;
    }
    
    .status-mini-chart {
        display: flex;
        gap: 5px;
        margin: 10px 0;
    }
    
    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Header
    st.title("📊 Main Topic Summary")
    st.caption("Your topics sorted by time spent (most → least)")
    
    # Date selector
    col1, col2 = st.columns([2, 3])
    with col1:
        selected_date = st.date_input("Date Range Start", value=datetime.date.today() - datetime.timedelta(days=7))
        end_date = datetime.date.today()
    with col2:
        st.info(f"📅 Showing data from {selected_date.isoformat()} to {end_date.isoformat()}")
    
    st.markdown("---")
    
    # Fetch and display topic summaries
    topic_summaries = get_topic_summaries(selected_date, end_date)
    
    if not topic_summaries:
        st.info("No topics found for this date range. Start planning to see summaries!")
        return
    
    # Sort by time spent (descending)
    topic_summaries.sort(key=lambda x: x['total_minutes'], reverse=True)
    
    # Display in grid (3 columns)
    st.markdown("### 🎯 Your Topics")
    
    # Create grid
    for i in range(0, len(topic_summaries), 3):
        cols = st.columns(3)
        for j, col in enumerate(cols):
            if i + j < len(topic_summaries):
                with col:
                    render_topic_card(topic_summaries[i + j])


def render_topic_card(topic: Dict):
    """Render a single topic summary card."""
    st.markdown(f"""
    <div class="summary-card">
        <div class="topic-name">🎯 {topic['name']}</div>
        <div class="time-badge">⏱ {format_minutes_to_hours(topic['total_minutes'])}</div>
        
        <div class="metric-row">
            <span class="metric-label">Subtasks:</span>
            <span class="metric-value">{topic['subtask_count']}</span>
        </div>
        
        <div class="metric-row">
            <span class="metric-label">Parts Completed:</span>
            <span class="metric-value">{topic['parts_done']} / {topic['parts_total']}</span>
        </div>
        
        <div class="metric-row">
            <span class="metric-label">Completion:</span>
            <span class="metric-value">{topic['completion_pct']:.0f}%</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Progress bar
    st.progress(topic['completion_pct'] / 100)
    
    # Status distribution mini chart
    st.caption("Status Distribution:")
    status_cols = st.columns(4)
    status_cols[0].metric("Done", topic['status_counts'].get('Done', 0))
    status_cols[1].metric("Doing", topic['status_counts'].get('Doing', 0))
    status_cols[2].metric("Not Started", topic['status_counts'].get('Not Started', 0))
    status_cols[3].metric("Postponed", topic['status_counts'].get('Postponed', 0))


def get_topic_summaries(start_date: datetime.date, end_date: datetime.date) -> List[Dict]:
    """Get summary data for all Main Topics in date range."""
    conn = get_conn()
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    c = conn.cursor()
    
    # Get all projects in date range
    c.execute(
        """
        SELECT DISTINCT name FROM project
        WHERE date >= ? AND date <= ?
        ORDER BY name
        """,
        (start_date.isoformat(), end_date.isoformat())
    )
    project_names = [row['name'] for row in c.fetchall()]
    
    summaries = []
    
    for project_name in project_names:
        # Get all tasks for this project
        c.execute(
            """
            SELECT t.*, p.id as project_id FROM task t
            JOIN project p ON t.project_id = p.id
            WHERE p.name = ? AND t.date >= ? AND t.date <= ?
            """,
            (project_name, start_date.isoformat(), end_date.isoformat())
        )
        tasks = c.fetchall()
        
        if not tasks:
            continue
        
        # Calculate metrics
        subtask_count = len(tasks)
        total_minutes = sum(task.get('duration_minutes', 0) or 0 for task in tasks)
        
        # Get parts
        task_ids = [t['id'] for t in tasks]
        placeholders = ','.join('?' * len(task_ids))
        c.execute(f"SELECT * FROM part WHERE task_id IN ({placeholders})", task_ids)
        parts = c.fetchall()
        
        parts_total = len(parts)
        parts_done = sum(1 for p in parts if p.get('status') == STATUS_DONE)
        completion_pct = (parts_done / parts_total * 100) if parts_total > 0 else 0
        
        # Status counts
        status_counts = {}
        for status in ['Done', 'Doing', 'Not Started', 'Postponed']:
            count = sum(1 for p in parts if p.get('status') == status)
            status_counts[status] = count
        
        summaries.append({
            'name': project_name,
            'subtask_count': subtask_count,
            'parts_total': parts_total,
            'parts_done': parts_done,
            'completion_pct': completion_pct,
            'total_minutes': total_minutes,
            'status_counts': status_counts
        })
    
    conn.close()
    return summaries
