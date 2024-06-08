import { IAction, IAuthData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
const rawAuthData = localStorage.getItem("auth_data");
let authData: IAuthData | null = null;
if (rawAuthData) {
    authData = JSON.parse(rawAuthData);
}
const initialState = {
    status: authData?.status || false,
    userData: authData?.userData || null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state: IAuthData, action: IAction) => {
            const newState = {
                status: true,
                userData: action.payload,
            };
            localStorage.setItem("auth_data", JSON.stringify(newState));
            state.status = newState.status;
            state.userData = newState.userData;
        },
        logout: (state: IAuthData) => {
            const newState = {
                status: false,
                userData: null,
            };
            localStorage.setItem("auth_data", JSON.stringify(newState));
            state.status = newState.status;
            state.userData = newState.userData;
        },
    },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
