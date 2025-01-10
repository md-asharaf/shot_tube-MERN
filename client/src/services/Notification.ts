import axios from "@/lib/axios";

class NotificationService {
    getNotifications = async () =>
        await axios.get("/notifications/all-notifications");
    markAsRead = async (id: string) =>
        await axios.patch(`/notifications/mark-as-read/${id}`);
    markAllAsRead = async () =>
        await axios.patch("/notifications/mark-all-as-read");
}

export default new NotificationService();