import { IVideoData } from "@/interfaces";
import { createContext, useContext } from "react";
const VideoContext = createContext({
    videos: [] as IVideoData[],
    addVideo: (video: IVideoData) => {},
    deleteVideo: (id: string) => {},
    setVideos: (videos: IVideoData[]) => {},
});

export const useVideo = () => {
    return useContext(VideoContext);
};
export default VideoContext.Provider;
