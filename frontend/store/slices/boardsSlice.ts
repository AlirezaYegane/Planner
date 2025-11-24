import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import { Board, BoardCreateRequest, GroupCreateRequest } from '../../lib/types';

interface BoardsState {
    items: Board[];
    currentBoard: Board | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BoardsState = {
    items: [],
    currentBoard: null,
    status: 'idle',
    error: null,
};

export const fetchBoards = createAsyncThunk(
    'boards/fetchBoards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getBoards();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch boards');
        }
    }
);

export const fetchBoard = createAsyncThunk(
    'boards/fetchBoard',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.getBoard(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch board');
        }
    }
);

export const createBoard = createAsyncThunk(
    'boards/createBoard',
    async (data: BoardCreateRequest, { rejectWithValue }) => {
        try {
            const response = await api.createBoard(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to create board');
        }
    }
);

export const deleteBoard = createAsyncThunk(
    'boards/deleteBoard',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.deleteBoard(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to delete board');
        }
    }
);

export const createGroup = createAsyncThunk(
    'boards/createGroup',
    async ({ boardId, data }: { boardId: number; data: GroupCreateRequest }, { rejectWithValue }) => {
        try {
            const response = await api.createGroup(boardId, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to create group');
        }
    }
);

const boardsSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {
        setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
            state.currentBoard = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Boards
            .addCase(fetchBoards.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchBoards.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Fetch Board
            .addCase(fetchBoard.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBoard.fulfilled, (state, action: PayloadAction<Board>) => {
                state.status = 'succeeded';
                state.currentBoard = action.payload;
            })
            // Create Board
            .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
                state.items.push(action.payload);
            })
            // Delete Board
            .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter((board) => board.id !== action.payload);
                if (state.currentBoard?.id === action.payload) {
                    state.currentBoard = null;
                }
            })
            // Create Group
            .addCase(createGroup.fulfilled, (state, action: PayloadAction<any>) => {
                // We might need to refresh the board or update the current board state manually
                // For now, let's assume we'll re-fetch the board or the backend returns the updated board
                // But the API returns the group, so we might need to handle this better in a real app
            });
    },
});

export const { setCurrentBoard } = boardsSlice.actions;
export default boardsSlice.reducer;
