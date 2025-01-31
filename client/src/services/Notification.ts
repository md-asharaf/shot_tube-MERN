import axios from "@/lib/axios";

class NotificationService {
    getNotifications = async (page:number) =>
        await axios.get(`/notifications/all-notifications?page=${page}`);
    markAsRead = async (id:string) =>
        await axios.patch(`/notifications/mark-as-read?id=${id}`);
    markAllAsRead = async () =>
        await axios.patch("/notifications/mark-all-as-read");
    deleteNotification = async (createdAt:Date) =>
        await axios.delete(`/notifications/delete-notification?createdAt=${createdAt}`);
}

export default new NotificationService();