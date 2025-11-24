import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import { Plan, PlanCreateRequest } from '../../lib/types';

interface PlansState {
  items: Plan[];
  currentPlan: Plan | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PlansState = {
  items: [],
  currentPlan: null,
  status: 'idle',
  error: null,
};

export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (params: { start_date?: string; end_date?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.getPlans(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch plans');
    }
  }
);

export const fetchPlanByDate = createAsyncThunk(
  'plans/fetchPlanByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await api.getPlanByDate(date);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch plan');
    }
  }
);

export const createPlan = createAsyncThunk(
  'plans/createPlan',
  async (data: PlanCreateRequest, { rejectWithValue }) => {
    try {
      const response = await api.createPlan(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create plan');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async ({ date, data }: { date: string; data: Partial<PlanCreateRequest> }, { rejectWithValue }) => {
    try {
      const response = await api.updatePlan(date, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update plan');
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Plan[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Plan By Date
      .addCase(fetchPlanByDate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlanByDate.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.status = 'succeeded';
        state.currentPlan = action.payload;
      })
      .addCase(fetchPlanByDate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create Plan
      .addCase(createPlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.items.push(action.payload);
        state.currentPlan = action.payload;
      })
      // Update Plan
      .addCase(updatePlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        const index = state.items.findIndex((plan) => plan.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentPlan = action.payload;
      });
  },
});

export const { clearCurrentPlan } = plansSlice.actions;
export default plansSlice.reducer;
