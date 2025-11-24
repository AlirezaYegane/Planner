import streamlit as st
from src.database import init_db
from src.ui.planning_wizard import page_planning_wizard
from src.ui.add_plan import page_add_plan
from src.ui.checklist import page_checklist
from src.ui.kanban_view import page_kanban
from src.ui.topic_summary import page_topic_summary
from src.ui.reports import page_reports
from src.ui.history import page_history

try:
    import jdatetime
except ImportError:
    jdatetime = None

def run_app():
    st.set_page_config(
        page_title="Deep Focus Planner",
        page_icon="✅",
        layout="wide",
    )
    init_db()

    st.sidebar.title("📚 Deep Focus Planner")

    page = st.sidebar.radio(
        "Navigation:",
        (
            "📌 Daily Planning Wizard",
            "🎯 Kanban Board",
            "✅ Daily Checklist",
            "📊 Topic Summary",
            "📈 Reports",
            "📜 History",
        ),
    )

    st.sidebar.markdown("---")
    st.sidebar.info(
        "**New Wizard System!**\n"
        "- Plan your day step-by-step\n"
        "- Track progress visually\n"
        "- View analytics & insights\n"
        "- Professional & clean UI"
    )
    
    if jdatetime is None:
        st.sidebar.warning(
            "For Persian dates: pip install jdatetime"
        )

    if page == "📌 Daily Planning Wizard":
        page_planning_wizard()
    elif page == "🎯 Kanban Board":
        page_kanban()
    elif page == "✅ Daily Checklist":
        page_checklist()
    elif page == "📊 Topic Summary":
        page_topic_summary()
    elif page == "📈 Reports":
        page_reports()
    else:
        page_history()
