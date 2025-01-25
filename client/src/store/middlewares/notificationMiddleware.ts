import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
    resetNotificationCount,
    addNotification,
} from "../reducers/notification";
export const notificationMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        const result = next(action);
        if (
            resetNotificationCount.match(action) ||
            addNotification.match(action)
        ) {
            localStorage.setItem(
                "new_notification_count",
                store.getState().notification.newNotificationCount.toString()
            );
        }
        return result;
    };
