import pandas as pd

def compute_streak(df: pd.DataFrame, threshold: float = 80.0) -> int:
    """Return the best streak of days with completion >= threshold%."""
    if df.empty:
        return 0
    df_sorted = df.sort_values("date")
    streak = 0
    best = 0
    for _, row in df_sorted.iterrows():
        if row["completion"] >= threshold:
            streak += 1
            best = max(best, streak)
        else:
            streak = 0
    return best
