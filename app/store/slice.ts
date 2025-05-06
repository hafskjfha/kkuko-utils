import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState } from "@/app/types/type";

interface RootState{
    user:{
        username:string | undefined ;
        uuid: string | undefined;
        role: "guest" | "r1" | "r2" | "r3" | "r4" | "admin"
    },
    loading: LoadingState,

}

const initialState: RootState = {
    user:{
        username: undefined,
        uuid: undefined,
        role: "guest",
    },
    loading:{
        isLoading: true,
        progress: 0,
        currentTask: '초기화 중...',
    }
};

const UserSlice = createSlice({
    name: "user",
    initialState: initialState.user,
    reducers:{
        setInfo: (state,action:PayloadAction<{username?:string, role: "guest" | "r1" | "r2" | "r3" | "r4" | "admin", uuid?: string}>) => {
            state.username = action.payload.username;
            state.role = action.payload.role;
            state.uuid = action.payload.uuid;
        }
    }
});

const LoadingSlice = createSlice({
    name: 'loading',
    initialState: initialState.loading,
    reducers:{
        updateLoadingState: (
            state,
            action: PayloadAction<{ progress: number; task: string }>
          ) => {
            state.progress = action.payload.progress;
            state.currentTask = action.payload.task;
            state.isLoading = action.payload.progress < 100;
          },
          resetLoadingState: () => initialState.loading,
    }
})


export const userAction = UserSlice.actions;
export const { updateLoadingState, resetLoadingState } = LoadingSlice.actions;

export const userReducer = UserSlice.reducer;
export const loadingReducer = LoadingSlice.reducer;