import datetime

try:
    import jdatetime  # For Persian (Jalali) dates
except ImportError:
    jdatetime = None

def gregorian_to_persian_str(date: datetime.date) -> str:
    """Convert a Gregorian date to a Jalali (Persian) date string."""
    if jdatetime is None:
        return "Install 'jdatetime' to see Persian date"
    jd = jdatetime.date.fromgregorian(date=date)
    # Format: 1403-09-03
    return jd.strftime("%Y-%m-%d")


def motivational_message(pct: float) -> str:
    """Return a short motivational string based on daily completion."""
    if pct >= 90:
        return "Almost operating at robot level. Respect. 👑"
    if pct >= 75:
        return "Strong progress. A little extra push and you crush the day. ⭐"
    if pct >= 50:
        return "Halfway done. Perfect time to lock in and avoid doom-scrolling."
    if pct > 0:
        return "You started, and that matters. Now keep the momentum."
    return "Currently at 0%. Save the day by completing at least one part."
