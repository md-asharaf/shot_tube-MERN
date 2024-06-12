import { IAction, IAuthData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
import userServices from "@/services/user.services";

// const rawAuthData = localStorage.getItem("auth_data");
// let authData: IAuthData | null = null;
// if (rawAuthData) {
//     authData = JSON.parse(rawAuthData);
// }
const currentUser = (await userServices.getCurrentUser())?.data;
const initialState = {
    status: currentUser ? true : false,
    userData: currentUser,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state: IAuthData, action: IAction) => {
            const userData = action.payload;
            // localStorage.setItem("auth_data", JSON.stringify(newState));
            state.status = true;
            state.userData = userData;
        },
        logout: (state: IAuthData) => {
            // localStorage.setItem("auth_data", JSON.stringify(newState));
            state.status = false;
            state.userData = null;
        },
    },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
