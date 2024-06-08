import { IUiData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
const rawData = localStorage.getItem("ui_data");
let uiData: IUiData|null=null;
if (rawData) {
    uiData = JSON.parse(rawData);
}
const initialState = {
    isMenuOpen: uiData?.isMenuOpen||true,
    isVideoModalOpen:uiData?.isVideoModalOpen|| false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleMenu: (state:IUiData) => {
            state.isMenuOpen = !state.isMenuOpen;
            localStorage.setItem("ui_data", JSON.stringify(state));
        },
        toggleVideoModal: (state:IUiData) => {
            state.isVideoModalOpen = !state.isVideoModalOpen;
            localStorage.setItem("ui_data", JSON.stringify(state));
        },
    },
});
export const { toggleMenu, toggleVideoModal } = uiSlice.actions;
export default uiSlice.reducer;
