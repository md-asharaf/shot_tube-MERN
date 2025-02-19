import Axios from "@/lib/axios";

class ShortSevice {
    upload = async (data: any) =>
        await Axios.post("/shorts/publish-short", data);
    singleShort = async (shortId: string) =>
        await Axios.get(`/shorts/${shortId}`);
    allShortsByUser = async (userId: string) =>
        await Axios.get(`/shorts/user-shorts/${userId}`);
    likedShorts = async () => await Axios.get("/shorts/liked-shorts");
    incrementViews = async (shortId: string) =>
        await Axios.post(`/shorts/increase-views/${shortId}`);
    searchShorts = async (query: string) =>
        await Axios.get(`/shorts/search-shorts?query=${query}`);
    recommendedShorts = async (page:number,shortId=null,userId=null) =>
        await Axios.get(
            `/shorts/recommended-shorts?page=${page}${shortId?`&shortId=${shortId}`:""}${userId?`&userId=${userId}`:""}`
        );
    updateShort = async (shortId: string, data: any) =>
        await Axios.patch(`/shorts/update-short/${shortId}`, data);
    randomShort = async () =>
        await Axios.get("/shorts/random-short");
}
export const shortService = new ShortSevice();