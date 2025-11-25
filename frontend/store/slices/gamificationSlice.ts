import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

// Types
interface UserStats {
    id: number;
    user_id: number;
    total_xp: number;
    level: number;
    total_points: number;
    current_streak: number;
    longest_streak: number;
    total_tasks_completed: number;
    total_focus_time: number;
    last_activity_date: string | null;
    xp_to_next_level: number;
}

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string | null;
    criteria_type: string;
    criteria_value: number;
    xp_reward: number;
    tier: string;
    is_active: boolean;
}

interface UserAchievement {
    id: number;
    user_id: number;
    achievement_id: number;
    unlocked_at: string;
    progress: number;
    achievement?: Achievement;
}

interface FocusSession {
    id: number;
    user_id: number;
    task_id: number | null;
    start_time: string;
    end_time: string | null;
    duration_minutes: number;
    session_type: string;
    planned_duration: number;
    was_completed: boolean;
    task_completed_in_session: boolean;
    xp_earned: number;
    interruptions: number;
    flow_rating: number | null;
}

interface DailyStats {
    id: number;
    user_id: number;
    date: string;
    tasks_created: number;
    tasks_completed: number;
    tasks_postponed: number;
    focus_sessions_count: number;
    total_focus_minutes: number;
    completed_focus_sessions: number;
    xp_earned: number;
    achievements_unlocked: number;
    completion_rate: number;
    average_flow_rating: number | null;
    daily_goal_met: number;
}

interface GamificationState {
    userStats: UserStats | null;
    achievements: UserAchievement[];
    activeFocusSession: FocusSession | null;
    dailyProgress: DailyStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: GamificationState = {
    userStats: null,
    achievements: [],
    activeFocusSession: null,
    dailyProgress: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchUserStats = createAsyncThunk(
    'gamification/fetchUserStats',
    async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch user stats');
        return response.json();
    }
);

export const fetchAchievements = createAsyncThunk(
    'gamification/fetchAchievements',
    async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/achievements?include_locked=true`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch achievements');
        return response.json();
    }
);

export const startFocusSession = createAsyncThunk(
    'gamification/startFocusSession',
    async (params: { task_id?: number; session_type?: string; planned_duration?: number }) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('Failed to start focus session');
        return response.json();
    }
);

export const completeFocusSession = createAsyncThunk(
    'gamification/completeFocusSession',
    async (params: { session_id: number; duration_minutes: number; was_completed: boolean; task_completed?: boolean; flow_rating?: number }) => {
        const { session_id, ...updateData } = params;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/sessions/${session_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                end_time: new Date().toISOString(),
                duration_minutes: updateData.duration_minutes,
                was_completed: updateData.was_completed,
                task_completed_in_session: updateData.task_completed || false,
                flow_rating: updateData.flow_rating,
            }),
        });
        if (!response.ok) throw new Error('Failed to complete focus session');
        return response.json();
    }
);

export const fetchGamificationSummary = createAsyncThunk(
    'gamification/fetchSummary',
    async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/summary`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch gamification summary');
        return response.json();
    }
);

// Slice
const gamificationSlice = createSlice({
    name: 'gamification',
    initialState,
    reducers: {
        clearActiveFocusSession: (state) => {
            state.activeFocusSession = null;
        },
        updateLocalXP: (state, action: PayloadAction<number>) => {
            if (state.userStats) {
                state.userStats.total_xp += action.payload;
                state.userStats.level = Math.floor(Math.sqrt(state.userStats.total_xp / 500)) + 1;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch user stats
        builder.addCase(fetchUserStats.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUserStats.fulfilled, (state, action) => {
            state.loading = false;
            state.userStats = action.payload;
        });
        builder.addCase(fetchUserStats.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch stats';
        });

        // Fetch achievements
        builder.addCase(fetchAchievements.fulfilled, (state, action) => {
            state.achievements = action.payload;
        });

        // Start focus session
        builder.addCase(startFocusSession.fulfilled, (state, action) => {
            state.activeFocusSession = action.payload;
        });

        // Complete focus session
        builder.addCase(completeFocusSession.fulfilled, (state, action) => {
            state.activeFocusSession = null;
            // Update stats with earned XP
            if (state.userStats && action.payload.xp_earned) {
                state.userStats.total_xp += action.payload.xp_earned;
                state.userStats.total_focus_time += action.payload.duration_minutes;
                state.userStats.level = Math.floor(Math.sqrt(state.userStats.total_xp / 500)) + 1;
            }
        });

        // Fetch summary
        builder.addCase(fetchGamificationSummary.fulfilled, (state, action) => {
            state.userStats = action.payload.user_stats;
            state.achievements = action.payload.recent_achievements;
            state.dailyProgress = action.payload.daily_progress;
        });
    },
});

export const { clearActiveFocusSession, updateLocalXP } = gamificationSlice.actions;
export default gamificationSlice.reducer;
