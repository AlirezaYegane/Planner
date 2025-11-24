import datetime
import streamlit as st
import pandas as pd
from src.database import get_existing_dates, get_parts_for_date
from src.utils import gregorian_to_persian_str

def page_history():
    st.header("📜 Daily History & Details")

    available_dates = get_existing_dates()
    if not available_dates:
        st.info("No days recorded yet. Start by adding a plan for today.")
        return

    # Default to the most recent date
    default_date = available_dates[0]
    date = st.date_input("Select a day", value=default_date)
    persian_date = gregorian_to_persian_str(date)
    st.caption(f"Persian date: {persian_date}")

    parts = get_parts_for_date(date)
    if not parts:
        st.warning("No tasks found for this exact day, even though there is nearby data.")
        return

    # Summary
    total = len(parts)
    done = sum(1 for r in parts if r["is_done"])
    pct = (done / total) * 100 if total else 0
    st.subheader(f"Summary for {date.isoformat()} ({pct:.1f}% – {done}/{total} parts done)")

    # Detailed hierarchical view (read-only)
    current_project = None
    current_task = None
    for r in parts:
        proj = r["project_name"]
        task = r["task_name"]
        completed_at = r["completed_at"]

        if proj != current_project:
            st.markdown(f"### 🧭 {proj}")
            current_project = proj
            current_task = None

        if task != current_task:
            st.markdown(f"**🔹 {task}**")
            current_task = task

        status = "✅" if r["is_done"] else "⬜"
        time_str = ""
        if completed_at:
            # Show only time + date in a compact form
            try:
                dt = datetime.datetime.fromisoformat(completed_at)
                time_str = f" (done at {dt.strftime('%H:%M  %Y-%m-%d')})"
            except Exception:
                time_str = f" (done at {completed_at})"

        st.markdown(f"{status} {r['part_name']}{time_str}")

    # Tabular history for that day
    st.markdown("---")
    st.subheader("Tabular view for this day")

    data_rows = []
    for r in parts:
        data_rows.append(
            {
                "Project": r["project_name"],
                "Task": r["task_name"],
                "Part": r["part_name"],
                "Done": bool(r["is_done"]),
                "Completed at": r["completed_at"],
            }
        )
    df = pd.DataFrame(data_rows)
    st.dataframe(df, use_container_width=True)
