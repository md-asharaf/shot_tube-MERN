import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
    toggleMenu,
} from "../reducers/ui";

export const uiMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        const result = next(action);
        if (
            toggleMenu.match(action)
        ) {
            const uiState = {isMenuOpen:store.getState().ui.isMenuOpen};
            localStorage.setItem("ui_state", JSON.stringify(uiState));
        }
        return result;
    };
