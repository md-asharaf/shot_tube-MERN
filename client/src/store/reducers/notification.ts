import { INotification } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
interface INotificationsData {
    socket: any;
    notifications: INotification[];
}

const rawData = localStorage.getItem("notification_data")
let notificationsData : Partial<INotificationsData> | null = null;
try {
    notificationsData = rawData ? JSON.parse(rawData) : null;
} catch (error) {
    notificationsData = null;
}
const initialState = {
    socket: notificationsData?.socket ?? null,
    notifications: notificationsData?.notifications ?? [],
};


const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        connectSocket: (state, action) => {
            state.socket = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        disconnectSocket: (state) => {
            state = initialState;
        },
        markNotificationAsRead: (state, action) => {
            state.notifications[action.payload].read = true;
        }
    },
});

export const { connectSocket, addNotification, setNotifications, disconnectSocket , markNotificationAsRead  } = notificationSlice.actions;
export default notificationSlice.reducer;