import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
    connectSocket,
    disconnectSocket,
    addNotification,
    setNotifications,
    markNotificationAsRead,
} from "../reducers/notification";
export const notificationMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        const result = next(action);
        if (
            connectSocket.match(action) ||
            disconnectSocket.match(action) ||
            addNotification.match(action) ||
            setNotifications.match(action) ||
            markNotificationAsRead.match(action)
        ) {
            const notificationState = store.getState().notification;
            localStorage.setItem(
                "notification_data",
                JSON.stringify(notificationState)
            );
        }
        return result;
    };
