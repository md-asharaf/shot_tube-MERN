import { IAuthData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
const initialState: IAuthData = {
    status: false,
    userData: null,
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const userData = action.payload;
            state.status = true;
            state.userData = userData;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        },
    },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
