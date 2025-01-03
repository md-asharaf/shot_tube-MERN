import { createSlice } from "@reduxjs/toolkit";
const theme = localStorage.getItem("theme");
const initialState = {
    mode: theme || "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
            localStorage.setItem("theme", state.mode);
        },
    },
});
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
