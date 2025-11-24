import datetime
import streamlit as st
import altair as alt
from src.database import get_completion_by_day
from src.analysis import compute_streak

def page_reports():
    st.header("📊 Progress Reports")

    today = datetime.date.today()
    view = st.selectbox(
        "Report range",
        ["Daily", "Weekly", "Monthly", "Yearly"],
    )

    if view == "Daily":
        start = st.date_input("From", today - datetime.timedelta(days=6))
        end = st.date_input("To", today)
    elif view == "Weekly":
        start = today - datetime.timedelta(weeks=12)
        end = today
    elif view == "Monthly":
        start = today - datetime.timedelta(days=365)
        end = today
    else:  # Yearly
        start = today - datetime.timedelta(days=365 * 3)
        end = today

    df_days = get_completion_by_day(start, end)
    if df_days.empty:
        st.info("No data for this range yet.")
        return

    # Aggregate depending on the selected view
    if view == "Daily":
        df_plot = df_days
        x_field = "date"
    elif view == "Weekly":
        df_plot = df_days.copy()
        df_plot["week"] = df_plot["date"].apply(
            lambda d: f"{d.isocalendar().year}-W{d.isocalendar().week:02d}"
        )
        df_plot = df_plot.groupby("week", as_index=False)["completion"].mean()
        x_field = "week"
    elif view == "Monthly":
        df_plot = df_days.copy()
        df_plot["month"] = df_plot["date"].apply(lambda d: d.strftime("%Y-%m"))
        df_plot = df_plot.groupby("month", as_index=False)["completion"].mean()
        x_field = "month"
    else:  # Yearly
        df_plot = df_days.copy()
        df_plot["year"] = df_plot["date"].apply(lambda d: d.year)
        df_plot = df_plot.groupby("year", as_index=False)["completion"].mean()
        x_field = "year"

    chart = (
        alt.Chart(df_plot)
        .mark_line(point=True)
        .encode(
            x=x_field,
            y=alt.Y("completion", title="Completion %", scale=alt.Scale(domain=[0, 100])),
            tooltip=[x_field, "completion"],
        )
    )
    st.altair_chart(chart, use_container_width=True)

    avg = df_days["completion"].mean()
    best = df_days["completion"].max()
    streak = compute_streak(df_days, threshold=80)

    st.subheader("Psychology summary")
    col1, col2, col3 = st.columns(3)
    col1.metric("Average completion", f"{avg:.1f}%")
    col2.metric("Best day", f"{best:.1f}%")
    col3.metric("Best ≥80% streak", f"{streak} days")

    st.caption(
        "Reasonable target: keep the average above ~75% and build streaks of at least 5 days. "
        "If you fall off, go back to the rule of 'at least one part per day'."
    )
