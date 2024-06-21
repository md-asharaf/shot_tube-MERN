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
            console.log("I AM IN LOGIN REDUCER");
            const userData = action.payload;
            localStorage.setItem(
                "auth_data",
                JSON.stringify({ status: true, userData })
            );
            state.status = true;
            state.userData = userData;
        },
        logout: (state) => {
            console.log("I AM IN LOGOUT REDUCER");
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
