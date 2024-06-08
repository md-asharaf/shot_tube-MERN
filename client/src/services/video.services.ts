import Axios from "@/config/request";

class VideoSevice {
    upload = async (data: FormData) =>
        await Axios.post("/videos/publish", data);
    getAll = async () => await Axios.get("/videos");
    getAVideo = async (videoId: string) =>
        await Axios.get(`/videos/${videoId}`);
    getAllVideosByUser = async (userId: string) =>
        await Axios.get(`/videos/${userId}/videos`);
}
export default new VideoSevice();
