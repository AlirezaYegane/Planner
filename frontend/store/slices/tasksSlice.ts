import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '../../lib/types';

interface TasksState {
    items: Task[];
    currentTask: Task | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TasksState = {
    items: [],
    currentTask: null,
    status: 'idle',
    error: null,
};

export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (params: { date?: string; status?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await api.getTasks(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tasks');
        }
    }
);

export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (data: TaskCreateRequest, { rejectWithValue }) => {
        try {
            const response = await api.createTask(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to create task');
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, data }: { id: number; data: TaskUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await api.updateTask(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to update task');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.deleteTask(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to delete task');
        }
    }
);

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setCurrentTask: (state, action: PayloadAction<Task | null>) => {
            state.currentTask = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tasks
            .addCase(fetchTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Create Task
            .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.items.push(action.payload);
            })
            // Update Task
            .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.items.findIndex((task) => task.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentTask?.id === action.payload.id) {
                    state.currentTask = action.payload;
                }
            })
            // Delete Task
            .addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter((task) => task.id !== action.payload);
                if (state.currentTask?.id === action.payload) {
                    state.currentTask = null;
                }
            });
    },
});

export const { setCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;
