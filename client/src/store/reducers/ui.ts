import { IUiData } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "date-fns";

const rawData = localStorage.getItem("ui_data");
let uiData: Partial<IUiData> | null = null;
try {
    uiData = rawData ? JSON.parse(rawData) : null;
} catch {
    uiData = null;
}

const initialState: IUiData = {
    isMenuOpen: uiData?.isMenuOpen ?? true, 
    isVideoModalOpen: uiData?.isVideoModalOpen ?? false, 
    isLoginPopoverVisible: uiData?.isLoginPopoverVisible ?? false,
    loginPopoverMessage: uiData?.loginPopoverMessage ?? "", 
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleMenu: (state, action: PayloadAction<boolean | undefined>) => {
            state.isMenuOpen = action.payload ?? !state.isMenuOpen;
        },
        toggleVideoModal: (state) => {
            state.isVideoModalOpen = !state.isVideoModalOpen;
        },
        toggleLoginPopover: (state, action: PayloadAction<boolean | undefined>) => {
            state.isLoginPopoverVisible = action.payload ?? !state.isLoginPopoverVisible;
        },
        setLoginPopoverMessage: (state, action: PayloadAction<string>) => {
            state.loginPopoverMessage = action.payload;
        },
    },
});

export const { toggleMenu, toggleVideoModal, toggleLoginPopover,setLoginPopoverMessage } = uiSlice.actions;

export default uiSlice.reducer;
