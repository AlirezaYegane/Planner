import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './slices/userSlice';
import tasksReducer from './slices/tasksSlice';
import boardsReducer from './slices/boardsSlice';
import plansReducer from './slices/plansSlice';
import teamsReducer from './slices/teamsSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        tasks: tasksReducer,
        boards: boardsReducer,
        plans: plansReducer,
        teams: teamsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
