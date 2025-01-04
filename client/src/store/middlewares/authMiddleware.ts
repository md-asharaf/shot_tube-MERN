import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { login, logout } from "../reducers/auth";
export const authMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        const result = next(action);
        if (login.match(action) || logout.match(action)) {
            const authState = store.getState().auth;
            localStorage.setItem("auth_data", JSON.stringify(authState));
        }
        return result;
    };
