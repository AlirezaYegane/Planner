import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/lib/types';

interface UserState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const initialState: UserState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            // Don't set isAuthenticated here - wait for setUser to verify token is valid
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setUser, setToken, logout, setLoading } = userSlice.actions;
export default userSlice.reducer;
