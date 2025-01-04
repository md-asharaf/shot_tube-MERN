import { createSlice } from "@reduxjs/toolkit";

interface IThemeData{
    mode: string;
}
const rawData = localStorage.getItem("theme_data");
let themeData: Partial<IThemeData> | null = null;
try {
    themeData = rawData ? JSON.parse(rawData) : null;
} catch {
    themeData = null;
}

const initialState: IThemeData = {
    mode: themeData?.mode ?? "light",
};
const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
        },
    },
});
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
