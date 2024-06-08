import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import uiReducer from "./ui.slice";
const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
    },
});
export default store;
