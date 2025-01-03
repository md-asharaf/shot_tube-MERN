import { IVideoData } from "@/interfaces";
import {formatDuration, formatViews} from "@/lib/utils"
const VideoCard2: React.FC<IVideoData> = (video) => {
    return (
        <div className="flex mb-5 border-b border-gray-700 pb-3">
            <div className="relative w-40 mr-5">
                <img
                    src={video.thumbnail}
                    className="h-full w-full aspect-video object-cover"
                    loading="lazy"
                />
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs">
                    {formatDuration(video.duration)}
                </span>
            </div>
            <div>
                <h3 className="text-lg mb-2">{video.title}</h3>
                <p className="text-gray-400">
                    {`${formatViews(video.views)} • ${video.createdAt}`}
                </p>
            </div>
        </div>
    );
};

export default VideoCard2;
