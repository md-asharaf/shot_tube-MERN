import { addNotification } from "@/store/reducers/notification";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
const SOCKET_URL = process.env.WEB_SOCKET_URL;
export default function useNotification() {
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            extraHeaders: {
                Cookie: document.cookie,
            },
        });

        socket.on("notification", (notification) => {
            console.log("New notification received:", notification);
            dispatch(addNotification(notification));
        });

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });

        return () => {
            socket.disconnect();
        };
    }, [dispatch]);

    return;
}
