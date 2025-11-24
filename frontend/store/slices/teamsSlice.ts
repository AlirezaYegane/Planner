import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export interface TeamMember {
    id: number;
    user_id: number;
    team_id: number;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
    user_email: string;
}

export interface Team {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    members: TeamMember[];
}

interface TeamsState {
    items: Team[];
    currentTeam: Team | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TeamsState = {
    items: [],
    currentTeam: null,
    status: 'idle',
    error: null,
};

export const fetchTeams = createAsyncThunk(
    'teams/fetchTeams',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getTeams();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch teams');
        }
    }
);

export const createTeam = createAsyncThunk(
    'teams/createTeam',
    async (name: string, { rejectWithValue }) => {
        try {
            const response = await api.createTeam({ name });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to create team');
        }
    }
);

export const addTeamMember = createAsyncThunk(
    'teams/addMember',
    async ({ teamId, email, role }: { teamId: number; email: string; role: string }, { rejectWithValue }) => {
        try {
            const response = await api.addTeamMember(teamId, { email, role });
            return { teamId, member: response };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to add member');
        }
    }
);

const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {
        setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
            state.currentTeam = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeams.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                // Set first team as current if none selected
                if (!state.currentTeam && action.payload.length > 0) {
                    state.currentTeam = action.payload[0];
                }
            })
            .addCase(fetchTeams.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(createTeam.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.currentTeam = action.payload;
            })
            .addCase(addTeamMember.fulfilled, (state, action) => {
                const team = state.items.find(t => t.id === action.payload.teamId);
                if (team) {
                    team.members.push(action.payload.member);
                }
                if (state.currentTeam?.id === action.payload.teamId) {
                    state.currentTeam.members.push(action.payload.member);
                }
            });
    },
});

export const { setCurrentTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
