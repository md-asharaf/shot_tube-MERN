import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth";
import uiReducer from "./reducers/ui";
import themeReducer from "./reducers/theme";
const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        theme: themeReducer,
    },
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
