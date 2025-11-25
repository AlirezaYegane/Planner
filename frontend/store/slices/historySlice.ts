import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
interface TaskHistoryEntry {
    id: number;
    task_id: number;
    user_id: number;
    event_type: string;
    old_status: string | null;
    new_status: string | null;
    changes: any;
    notes: string | null;
    created_at: string;
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

interface ActivityDay {
    date: string;
    tasks_completed: number;
    focus_minutes: number;
    xp_earned: number;
    has_activity: boolean;
}

interface StreakData {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    activity_calendar: ActivityDay[];
}

interface HistoryState {
    taskHistory: TaskHistoryEntry[];
    dailyStats: DailyStats[];
    streakData: StreakData | null;
    loading: boolean;
    error: string | null;
}

const initialState: HistoryState = {
    taskHistory: [],
    dailyStats: [],
    streakData: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchTaskHistory = createAsyncThunk(
    'history/fetchTaskHistory',
    async (params?: { task_id?: number; start_date?: string; end_date?: string; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.task_id) queryParams.append('task_id', params.task_id.toString());
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/tasks?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch task history');
        return response.json();
    }
);

export const fetchDailyStats = createAsyncThunk(
    'history/fetchDailyStats',
    async (params?: { start_date?: string; end_date?: string; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/daily-stats?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch daily stats');
        return response.json();
    }
);

export const fetchStreakData = createAsyncThunk(
    'history/fetchStreakData',
    async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/streak`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch streak data');
        return response.json();
    }
);

// Slice
const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        clearHistory: (state) => {
            state.taskHistory = [];
            state.dailyStats = [];
            state.streakData = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch task history
        builder.addCase(fetchTaskHistory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTaskHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.taskHistory = action.payload;
        });
        builder.addCase(fetchTaskHistory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch task history';
        });

        // Fetch daily stats
        builder.addCase(fetchDailyStats.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchDailyStats.fulfilled, (state, action) => {
            state.loading = false;
            state.dailyStats = action.payload;
        });
        builder.addCase(fetchDailyStats.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch daily stats';
        });

        // Fetch streak data
        builder.addCase(fetchStreakData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchStreakData.fulfilled, (state, action) => {
            state.loading = false;
            state.streakData = action.payload;
        });
        builder.addCase(fetchStreakData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch streak data';
        });
    },
});

export const { clearHistory } = historySlice.actions;
export default historySlice.reducer;
