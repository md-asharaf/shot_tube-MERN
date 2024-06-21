import { IAuthData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
const auth = JSON.parse(localStorage.getItem("auth_data"));
const initialState: IAuthData = {
    status: auth?.status || false,
    userData: auth?.userData || null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const userData = action.payload;
            localStorage.setItem(
                "auth_data",
                JSON.stringify({ status: true, userData })
            );
            state.status = true;
            state.userData = userData;
        },
        logout: (state) => {
            localStorage.setItem(
                "auth_data",
                JSON.stringify({ status: false, userData: null })
            );
            state.status = false;
            state.userData = null;
        },
    },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
