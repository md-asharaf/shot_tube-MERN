import Axios from "@/config/request";

class VideoSevice {
    upload = async (data: FormData) =>
        await Axios.post("/videos/publish", data);
    allVideos = async () => await Axios.get("/videos");
    singleVideo = async (videoId: string) =>
        await Axios.get(`/videos/${videoId}`);
    allVideosByUser = async (userId: string) =>
        await Axios.get(`/videos/${userId}/videos`);
    likedVideos = async () => await Axios.get("/likes/liked-videos");
    incrementViews = async (videoId: string) =>
        await Axios.post(`/videos/${videoId}/increase`);
}
export default new VideoSevice();
