import { IAuthData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
import userServices from "@/services/user.services";
let currentUser = null;
const fetchCurrentUser = async () => {
    const res = await userServices.getCurrentUser();
    if (res.data) {
        currentUser = res.data;
    }
};
fetchCurrentUser();
console.log("CURRENTUSER: ", currentUser);
const initialState: IAuthData = {
    status: currentUser ? true : false,
    userData: currentUser,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const userData = action.payload;
            // localStorage.setItem("auth_data", JSON.stringify(newState));
            state.status = true;
            state.userData = userData;
        },
        logout: (state) => {
            // localStorage.setItem("auth_data", JSON.stringify(newState));
            state.status = false;
            state.userData = null;
        },
    },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
