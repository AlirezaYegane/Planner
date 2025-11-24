"""
Gamification & Reward System for Kanban Planner
Variable rewards, celebrations, memes
"""

import streamlit as st
import random

# Cat meme URLs (placeholder - you can add real URLs or local files)
CAT_MEMES = [
    "https://cataas.com/cat/says/Great%20Job!",
    "https://cataas.com/cat/says/You%20did%20it!",
    "https://cataas.com/cat/says/Amazing!",
    "https://cataas.com/cat/cute",
    "https://cataas.com/cat/says/Keep%20going!",
]

POSITIVE_MESSAGES = [
    "🎉 Awesome! You're on fire!",
    "⭐ Great work! Keep the momentum going!",
    "💪 You're crushing it today!",
    "🚀 One step closer to your goals!",
    "🌟 Fantastic progress!",
    "✨ You're doing amazing!",
    "🎯 Right on target!",
    "🏆 Champion mindset!",
]

COMPLETION_MESSAGES = {
    "part": [
        "Nice! Part completed ✓",
        "Small win! Keep going!",
        "Another one done!",
    ],
    "subtask": [
        "🎊 Subtask complete! All parts done!",
        "🌈 Great! This subtask is finished!",
        "💫 Subtask conquered!",
    ],
    "main_topic": [
        "🎉🎉🎉 MAIN TOPIC COMPLETE! 🎉🎉🎉",
        "🏆 INCREDIBLE! Full topic finished!",
        "🌟 YOU'RE A PRODUCTIVITY ROCKSTAR! 🌟",
    ]
}


def trigger_celebration(completion_type: str = "part", show_meme: bool = None):
    """
    Trigger a celebration based on what was completed.
    
    Args:
        completion_type: "part", "subtask", or "main_topic"
        show_meme: If True, show meme. If None, use probability
    """
    # Variable reward probabilities
    if show_meme is None:
        if completion_type == "part":
            show_meme = random.random() < 0.3  # 30% chance for part
        elif completion_type == "subtask":
            show_meme = random.random() < 0.7  # 70% chance for subtask
        else:  # main_topic
            show_meme = True  # 100% chance for main topic
    
    # Show message
    messages = COMPLETION_MESSAGES.get(completion_type, POSITIVE_MESSAGES)
    message = random.choice(messages)
    
    if completion_type == "main_topic":
        st.balloons()
        st.success(message)
    elif completion_type == "subtask":
        st.success(message)
    else:
        st.toast(message, icon="✅")
    
    # Show meme/reward
    if show_meme:
        meme_type = random.choice(["cat", "message", "both"])
        
        if meme_type in ["cat", "both"]:
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                try:
                    st.image(random.choice(CAT_MEMES), caption="🎉 Celebration!", width=300)
                except:
                    pass  # If image fails, just skip it
        
        if meme_type in ["message", "both"]:
            st.info(f"💬 {random.choice(POSITIVE_MESSAGES)}")


def show_progress_celebration(old_progress: float, new_progress: float):
    """
    Celebrate milestone progress increases.
    
    Args:
        old_progress: Previous progress (0.0 to 1.0)
        new_progress: New progress (0.0 to 1.0)
    """
    milestones = [0.25, 0.50, 0.75, 1.0]
    
    for milestone in milestones:
        if old_progress < milestone <= new_progress:
            pct = int(milestone * 100)
            if pct == 100:
                st.success(f"🎉 100% Complete! You finished everything!")
                st.balloons()
            elif pct == 75:
                st.info(f"⭐ {pct}% done! Almost there!")
            elif pct == 50:
                st.info(f"🎯 {pct}% complete! Halfway point!")
            elif pct == 25:
                st.info(f"👍 {pct}% done! Good start!")


def get_motivational_quote():
    """Return a random motivational quote."""
    quotes = [
        "The secret of getting ahead is getting started. - Mark Twain",
        "It always seems impossible until it's done. - Nelson Mandela",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "The future depends on what you do today. - Mahatma Gandhi",
        "Small daily improvements are the key to staggering long-term results.",
        "Progress, not perfection.",
        "Focus on being productive instead of busy.",
        "Your limitation—it's only your imagination.",
    ]
    return random.choice(quotes)
