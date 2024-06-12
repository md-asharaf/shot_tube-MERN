import store from "./store";
import { login, logout } from "./auth.slice";
import { toggleMenu } from "./ui.slice";
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { store, login, logout, toggleMenu };
