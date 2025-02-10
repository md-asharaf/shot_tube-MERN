// import { IUiData } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface IUiData {
    shareModalData: {
        open: boolean;
        id: string;
        type: string;
    };
    isMenuOpen: boolean;
    isVideoModalOpen: boolean;
    loginPopoverData: {
        open: boolean;
        message: string;
    };
    isCreatePlaylistDialogOpen: boolean;
    saveToplaylistModalData: {
        open: boolean;
        id: string;
    };
}
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
    loginPopoverData: {
        open: false,
        message: "",
    },
    shareModalData: {
        open: false,
        id: "",
        type: "",
    },
    isCreatePlaylistDialogOpen: false,
    saveToplaylistModalData: {
        open: false,
        id: "",
    },
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleMenu: (state, action: PayloadAction<boolean | undefined>) => {
            state.isMenuOpen = action.payload ?? !state.isMenuOpen;
        },
        toggleVideoModal: (
            state,
            action: PayloadAction<boolean | undefined>
        ) => {
            state.isVideoModalOpen = action.payload ?? !state.isVideoModalOpen;
        },
        setLoginPopoverData: (
            state,
            action: PayloadAction<{ open: boolean; message: string }>
        ) => {
            state.loginPopoverData = action.payload;
        },
        setShareModalData: (
            state,
            action: PayloadAction<{
                open: boolean;
                id: string;
                type: string;
            }>
        ) => {
            state.shareModalData = action.payload;
        },
        setCreatePlaylistDialog: (
            state,
            action: PayloadAction<boolean | undefined>
        ) => {
            state.isCreatePlaylistDialogOpen =
                action.payload ?? !state.isCreatePlaylistDialogOpen;
        },
        setSaveToPlaylistDialog: (
            state,
            action: PayloadAction<{ id: string; open: boolean }>
        ) => {
            state.saveToplaylistModalData = action.payload;
        },
    },
});

export const {
    toggleMenu,
    toggleVideoModal,
    setLoginPopoverData,
    setShareModalData,
    setCreatePlaylistDialog,
    setSaveToPlaylistDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
