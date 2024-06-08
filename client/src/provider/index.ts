import store from "./store";
import { login, logout } from "./auth.slice";
import { toggleMenu } from "./ui.slice";
export { store, login, logout, toggleMenu };
export type RootState = ReturnType<typeof store.getState>;
