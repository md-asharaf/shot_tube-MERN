import { IUiData } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const rawData = localStorage.getItem("ui_data");
let uiData: Partial<IUiData> | null = null;
try {
    uiData = rawData ? JSON.parse(rawData) : null;
} catch {
    uiData = null;
}

const initialState: IUiData = {
    isMenuOpen: uiData?.isMenuOpen ?? false, 
    isVideoModalOpen: false, 
    isLoginPopoverVisible: false,
    isShareModalOpen: false,
    videoId: "",
    loginPopoverMessage: "", 
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
        setShareModal: (state, action: PayloadAction<{open:boolean,videoId:string}>) => {
            state.isShareModalOpen = action.payload.open;
            state.videoId = action.payload.videoId;
        }
    },
});

export const { toggleMenu, toggleVideoModal, toggleLoginPopover,setLoginPopoverMessage,setShareModal } = uiSlice.actions;

export default uiSlice.reducer;
