import { formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";
import DefaultProfileImage from "@/assets/images/profile.png";
import ThreeDots from "./ThreeDots";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
interface Props {
    video: {
        _id: string;
        title: string;
        views: number;
        createdAt: Date;
    };
    creator?: {
        fullname: string;
        avatar: string;
        username: string;
    };
}
const VideoTitle: React.FC<Props> = ({ video, creator }) => {
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const navigate = useNavigate();
    return (
        <div className="flex space-x-3 dark:text-white items-start">
            {creator && (
                <img
                    className="w-10 h-10 rounded-full aspect-video object-cover"
                    src={creator.avatar || DefaultProfileImage}
                    alt={creator.fullname}
                    loading="lazy"
                />
            )}
            <div className="flex-1 overflow-hidden">
                <p className={`font-bold truncate ${!creator && "text-xs"}`}>
                    {video.title}
                </p>
                {creator && (
                    <span
                        onClick={(e) => {
                            navigate(`/${creator.username}/channel`);
                        }}
                        className="font-semibold text-gray-500 dark:text-zinc-400 hover:text-black truncate"
                    >
                        {creator.fullname}
                    </span>
                )}
                <p className="text-gray-500 dark:text-zinc-300 text-xs truncate">
                    {`${video.views} views • ${formatDistanceToNowStrict(
                        video.createdAt,
                        { addSuffix: true }
                    )}`}
                </p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <ThreeDots videoId={video._id} />
            </button>
        </div>
    );
};

export default VideoTitle;
