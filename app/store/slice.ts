import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RootState{
    user:{
        username:string | undefined ;
        uuid: string | undefined;
        role: "guest" | "r1" | "r2" | "r3" | "r4" | "admin"
    },
}

const initialState: RootState = {
    user:{
        username: undefined,
        uuid: undefined,
        role: "guest",
    },
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


export const userAction = UserSlice.actions;

export const userReducer = UserSlice.reducer;