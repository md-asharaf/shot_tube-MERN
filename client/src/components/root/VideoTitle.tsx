import { IVideoData } from "@/interfaces";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import DefaultProfileImage from "@/assets/images/profile.png";
interface Props {
    video: IVideoData;
    isImage?: boolean;
}
const VideoTitle: React.FC<Props> = ({ video, isImage = false }) => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center space-x-3 dark:text-white">
            {isImage && (
                <img
                    className="w-10 h-10 rounded-full"
                    src={video.creator.avatar?.url || DefaultProfileImage}
                    alt={video.creator.fullname}
                />
            )}
            <div className="flex-1 min-w-0">
                <p className={`font-bold truncate ${!isImage && "text-xs"}`}>
                    {video.title}
                </p>
                {isImage && (
                    <span
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${video.creator.username}/channel`);
                        }}
                        className="font-semibold text-gray-500 dark:text-zinc-400 hover:text-black truncate"
                    >
                        {video.creator.fullname}
                    </span>
                )}
                <p className="text-gray-500 dark:text-zinc-300 text-xs truncate">
                    {`${video.views} views • ${formatDistanceToNow(
                        video.createdAt,
                        { addSuffix: true }
                    )}`}
                </p>
            </div>
        </div>
    );
};

export default VideoTitle;
