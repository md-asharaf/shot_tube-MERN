import Axios from "@/config/request";

class SubService {
    toggleSubscription = async (channelId: string) =>
        await Axios.post(`/subscriptions/${channelId}/toggle-subscription`);
    getSubscribersCount = async (channelId: string) =>
        await Axios.get(`/subscriptions/${channelId}/subscribers-count`);
    isSubscribed = async (channelId: string) =>
        await Axios.get(`/subscriptions/${channelId}`);
    getSubscribedChannels = async (id: string) =>
        await Axios.get(`/subscriptions/${id}/subscriptions`);
}

export default new SubService();
