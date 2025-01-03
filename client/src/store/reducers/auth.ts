import { IUser } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
interface IAuthState {
    userData: IUser | null;
}
const initialState: IAuthState = {
    userData: null,
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const userData = action.payload;
            state.userData = userData;
        },
        logout: (state) => {
            state.userData = null;
        },
    },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
