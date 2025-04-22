import axios from "@/lib/axios";

class SubService {
    toggleSubscription = async (channelId: string) =>
        await axios.post(`/subscriptions/toggle-subscription/${channelId}`);
    getSubscribersCount = async (channelId: string) =>
        await axios.get(`/subscriptions/subscribers-count/${channelId}`);
    isChannelSubscribed = async (channelId: string) =>
        await axios.get(`/subscriptions/is-subscribed/${channelId}`);
    getSubscribedChannels = async (id: string) =>
        await axios.get(`/subscriptions/subscribed-channels/${id}`);
}

export const subService = new SubService();
