"""
Chart & Visualization Helpers for Daily Checklist
Advanced data-science-level charts using Plotly and Altair
"""

import altair as alt
import pandas as pd
import datetime
from typing import List, Dict

# Color palette
COLORS = {
    "primary": "#0073ea",
    "success": "#00c875",
    "warning": "#fdab3d", 
    "danger": "#e2445c",
    "neutral": "#c4c4c4",
    "accent": "#401694",
    "bg_light": "#f6f7fb",
    "border": "#d0d4e4"
}


def create_circular_progress_chart(completion_pct: float) -> alt.Chart:
    """Create animated circular progress chart."""
    # Create data for full circle
    df = pd.DataFrame({
        'category': ['Completed', 'Remaining'],
        'value': [completion_pct, 100 - completion_pct],
        'color': [COLORS['success'] if completion_pct >= 70 else COLORS['warning'], COLORS['neutral']]
    })
    
    chart = alt.Chart(df).mark_arc(innerRadius=50, outerRadius=70).encode(
        theta=alt.Theta('value:Q', stack=True),
        color=alt.Color('color:N', scale=None),
        tooltip=['category:N', 'value:Q']
    ).properties(
        width=150,
        height=150,
        title=f'{completion_pct:.0f}% Complete'
    )
    
    return chart


def create_radial_gauge(score: float, title: str = "Efficiency") -> alt.Chart:
    """Create radial gauge chart (speedometer style)."""
    # Create gauge data
    df = pd.DataFrame({
        'value': [score, 100 - score],
        'category': ['Score', 'Empty'],
        'color': [
            COLORS['success'] if score >= 80 else COLORS['warning'] if score >= 60 else COLORS['danger'],
            COLORS['neutral']
        ]
    })
    
    chart = alt.Chart(df).mark_arc(
        innerRadius=40,
        outerRadius=60,
        theta=alt.Theta('value:Q', stack=True, scale=alt.Scale(domain=[0, 100])),
        theta2=alt.ThetaValue(3.14)  # Half circle
    ).encode(
        color=alt.Color('color:N', scale=None),
        tooltip=['category', 'value']
    ).properties(
        width=120,
        height=80,
        title=f'{title}: {score:.0f}%'
    )
    
    return chart


def create_status_breakdown_chart(status_counts: Dict[str, int]) -> alt.Chart:
    """Create stacked horizontal bar for status breakdown."""
    df = pd.DataFrame([
        {'status': status, 'count': count, 'color': get_status_color(status)}
        for status, count in status_counts.items()
    ])
    
    chart = alt.Chart(df).mark_bar().encode(
        x=alt.X('count:Q', title='Number of Tasks'),
        color=alt.Color('color:N', scale=None),
        order=alt.Order('count:Q', sort='descending'),
        tooltip=['status:N', 'count:Q']
    ).properties(
        width=300,
        height=50,
        title='Task Status Distribution'
    )
    
    return chart


def create_time_heatmap(daily_data: List[Dict]) -> alt.Chart:
    """Create mini calendar heatmap for past 7 days."""
    df = pd.DataFrame(daily_data)  # Expected: [{'date': ..., 'completion': ...}, ...]
    
    chart = alt.Chart(df).mark_rect().encode(
        x=alt.X('date:T', title='Date', axis=alt.Axis(format='%m/%d')),
        color=alt.Color('completion:Q', 
                       scale=alt.Scale(scheme='greens'),
                       title='Completion %'),
        tooltip=['date:T', 'completion:Q']
    ).properties(
        width=400,
        height=80,
        title='Past 7 Days Activity'
    )
    
    return chart


def create_trendline_chart(daily_data: List[Dict], days: int = 7) -> alt.Chart:
    """Create productivity trendline over past N days."""
    df = pd.DataFrame(daily_data)
    
    # Line chart
    line = alt.Chart(df).mark_line(
        point=True,
        color=COLORS['primary']
    ).encode(
        x=alt.X('date:T', title='Date'),
        y=alt.Y('completion:Q', title='Completion %', scale=alt.Scale(domain=[0, 100])),
        tooltip=['date:T', 'completion:Q']
    )
    
    # Area fill
    area = alt.Chart(df).mark_area(
        opacity=0.3,
        color=COLORS['primary']
    ).encode(
        x='date:T',
        y='completion:Q'
    )
    
    chart = (area + line).properties(
        width=500,
        height=200,
        title=f'Productivity Trend (Past {days} Days)'
    )
    
    return chart


def create_time_allocation_chart(topic_data: List[Dict]) -> alt.Chart:
    """Create horizontal bar chart for time spent per Main Topic."""
    df = pd.DataFrame(topic_data)  # Expected: [{'topic': ..., 'minutes': ...}, ...]
    
    chart = alt.Chart(df).mark_bar(color=COLORS['primary']).encode(
        y=alt.Y('topic:N', sort='-x', title='Main Topic'),
        x=alt.X('minutes:Q', title='Time (minutes)'),
        tooltip=['topic:N', 'minutes:Q']
    ).properties(
        width=400,
        height=200,
        title='Time Allocation by Topic'
    )
    
    return chart


def create_postponed_analysis_chart(postponed_data: List[Dict]) -> alt.Chart:
    """Create chart showing most postponed tasks."""
    df = pd.DataFrame(postponed_data)  # Expected: [{'task': ..., 'count': ...}, ...]
    
    chart = alt.Chart(df).mark_bar(color=COLORS['danger']).encode(
        y=alt.Y('task:N', sort='-x', title='Task'),
        x=alt.X('count:Q', title='Times Postponed'),
        tooltip=['task:N', 'count:Q']
    ).properties(
        width=400,
        height=150,
        title='Most Postponed Tasks'
    )
    
    return chart


def get_status_color(status: str) -> str:
    """Get color for a status."""
    status_colors = {
        "Done": COLORS['success'],
        "Doing": COLORS['primary'],
        "Not Started": COLORS['neutral'],
        "Postponed": COLORS['danger']
    }
    return status_colors.get(status, COLORS['neutral'])


def create_efficiency_donut(productive_minutes: int, available_minutes: int) -> alt.Chart:
    """Create donut chart for time efficiency."""
    wasted = max(0, available_minutes - productive_minutes)
    
    df = pd.DataFrame({
        'category': ['Productive', 'Wasted'],
        'minutes': [productive_minutes, wasted],
        'color': [COLORS['success'], COLORS['neutral']]
    })
    
    chart = alt.Chart(df).mark_arc(innerRadius=50).encode(
        theta='minutes:Q',
        color=alt.Color('color:N', scale=None),
        tooltip=['category:N', 'minutes:Q']
    ).properties(
        width=150,
        height=150,
        title='Time Efficiency'
    )
    
    return chart
