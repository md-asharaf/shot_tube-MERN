import { IUiData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
const rawData = localStorage.getItem("ui_data");
let uiData: IUiData | null = null;
if (rawData) {
    uiData = JSON.parse(rawData);
}
const initialState = {
    isMenuOpen: uiData?.isMenuOpen == null ? true : uiData?.isMenuOpen,
    isVideoModalOpen: uiData?.isVideoModalOpen == null ? false : uiData?.isVideoModalOpen,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleMenu: (
            state: IUiData,
            action: {
                payload: boolean;
            }
        ) => {
            state.isMenuOpen = action.payload==null ? !state.isMenuOpen : action.payload;
            localStorage.setItem("ui_data", JSON.stringify(state));
        },
        toggleVideoModal: (state: IUiData) => {
            state.isVideoModalOpen = !state.isVideoModalOpen;
            localStorage.setItem("ui_data", JSON.stringify(state));
        },
    },
});
export const { toggleMenu, toggleVideoModal } = uiSlice.actions;
export default uiSlice.reducer;
