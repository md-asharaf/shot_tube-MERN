import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth";
import uiReducer from "./reducers/ui";
import themeReducer from "./reducers/theme";
import { uiMiddleware } from "./middlewares/uiMiddleware";
import { authMiddleware } from "./middlewares/authMiddleware";
import { themeMiddleware } from "./middlewares/themeMiddleware";
export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(uiMiddleware, authMiddleware, themeMiddleware),
});
export type AppDispatch = typeof store.dispatch;
export type RootState = {
    auth: ReturnType<typeof authReducer>,
    ui: ReturnType<typeof uiReducer>,
    theme: ReturnType<typeof themeReducer>
};
