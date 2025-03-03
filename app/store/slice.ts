import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RootState{
    user:{
        username:string | undefined ;
        role: "guest" | "r1" | "r2" | "r3" | "r4" | "admin"
    },
    words:{
        len5: string[];
        len6: string[];
    }
}

const initialState: RootState = {
    user:{
        username: undefined,
        role: "guest",
    },
    words:{
        len5: [],
        len6: [],
    }
};

const UserSlice = createSlice({
    name: "user",
    initialState: initialState.user,
    reducers:{
        setInfo: (state,action:PayloadAction<{username:string, role: "guest" | "r1" | "r2" | "r3" | "r4" | "admin"}>) => {
            state.username = action.payload.username;
            state.role = action.payload.role;
        }
    }
});

const WordsSlice = createSlice({
    name: "words",
    initialState: initialState.words,
    reducers: {
        setWords: (state, action: PayloadAction<{len6:string[], len5: string[]}>) => {
            state.len5 = action.payload.len5;
            state.len6 = action.payload.len6;
        }
    }
});

export const wordsAction = WordsSlice.actions;
export const userAction = UserSlice.actions;

export const wordsReducer = WordsSlice.reducer;
export const userReducer = UserSlice.reducer;