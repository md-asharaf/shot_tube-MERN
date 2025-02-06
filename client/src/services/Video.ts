import Axios from "@/lib/axios";

class VideoSevice {
    upload = async (data: any) =>
        await Axios.post("/videos/publish-video", data);
    singleVideo = async (videoId: string) =>
        await Axios.get(`/videos/${videoId}`);
    allVideosByUser = async (userId: string) =>
        await Axios.get(`/videos/user-videos/${userId}`);
    likedVideos = async () => await Axios.get("/videos/liked-videos");
    incrementViews = async (videoId: string) =>
        await Axios.post(`/videos/increase-views/${videoId}`);
    searchVideos = async (query: string) =>
        await Axios.get(`/videos/search-videos?query=${query}`);
    recommendedVideos = async (page: number, videoId = null, userId = null) =>
        await Axios.get(
            `/videos/recommended-videos?page=${page}${videoId?`&videoId=${videoId}`:""}${userId?`&userId=${userId}`:""}`
        );
}
export default new VideoSevice();
