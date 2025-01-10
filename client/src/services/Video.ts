import Axios from "@/lib/axios";

class VideoSevice {
    upload = async (data: any) =>
        await Axios.post("/videos/publish-video", data);
    allVideos = async (limit: number, page: number) =>
        await Axios.get(`/videos/all-videos?page=${page}&limit=${limit}`);
    singleVideo = async (videoId: string) =>
        await Axios.get(`/videos/${videoId}`);
    allVideosByUser = async (userId: string) =>
        await Axios.get(`/videos/user-videos/${userId}`);
    likedVideos = async () => await Axios.get("/videos/liked-videos");
    incrementViews = async (videoId: string) =>
        await Axios.post(`/videos/increase-views/${videoId}`);
    searchVideos = async (query: string) =>
        await Axios.get(`/videos/search-videos?query=${query}`);
    recommendedVideos = async (videoId: string, userId: string) =>
        await Axios.get(
            `/videos/recommended-videos?videoId=${videoId}&userId=${
                userId ?? ""
            }`
        );
}
export default new VideoSevice();
