import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
    toggleMenu,
    toggleVideoModal,
    toggleLoginPopover,
    setLoginPopoverMessage,
} from "../reducers/ui";

export const uiMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        const result = next(action);
        if (
            toggleMenu.match(action) ||
            toggleVideoModal.match(action) ||
            toggleLoginPopover.match(action) ||
            setLoginPopoverMessage.match(action)
        ) {
            const uiState = store.getState().ui;
            localStorage.setItem("ui_data", JSON.stringify(uiState));
        }
        return result;
    };
