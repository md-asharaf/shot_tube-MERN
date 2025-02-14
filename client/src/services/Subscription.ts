import Axios from "@/lib/axios";

class SubService {
    toggleSubscription = async (channelId: string) =>
        await Axios.post(`/subscriptions/toggle-subscription/${channelId}`);
    getSubscribersCount = async (channelId: string) =>
        await Axios.get(`/subscriptions/subscribers-count/${channelId}`);
    isChannelSubscribed = async (channelId: string) =>
        await Axios.get(`/subscriptions/is-subscribed/${channelId}`);
    getSubscribedChannels = async (id: string) =>
        await Axios.get(`/subscriptions/subscribed-channels/${id}`);
}

export const subService = new SubService();
