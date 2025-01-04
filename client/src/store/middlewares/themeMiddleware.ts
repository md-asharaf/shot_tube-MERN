import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { toggleTheme } from "../reducers/theme";
export const themeMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        const result = next(action);
        if (toggleTheme.match(action)) {
            const themeState = store.getState().theme;
            localStorage.setItem("theme_data", JSON.stringify(themeState));
        }
        return result;
    };
