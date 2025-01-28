import { formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";
import ThreeDots from "./ThreeDots";
import { formatViews } from "@/lib/utils";
import AvatarImg from "./AvatarImg";

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
    const navigate = useNavigate();

    return (
        <div className="flex space-x-3 dark:text-white items-start">
            {creator && (
                <div className="w-10 h-10 rounded-full object-cover aspect-square">
                    {" "}
                    <AvatarImg
                        avatar={creator.avatar}
                        fullname={creator.fullname}
                    />
                </div>
            )}
            <div className="flex-1 overflow-hidden">
                <p className={`font-bold truncate ${!creator && "text-xs"}`}>
                    {video.title}
                </p>
                {creator && (
                    <span
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/channel?u=${creator.username}`);
                        }}
                        className="font-semibold text-gray-500 dark:text-zinc-400 hover:text-black truncate cursor-pointer"
                    >
                        {creator.fullname}
                    </span>
                )}
                <p className="text-gray-500 dark:text-zinc-300 text-xs truncate">
                    {`${formatViews(video.views)} • ${formatDistanceToNowStrict(
                        video.createdAt,
                        {
                            addSuffix: true,
                        }
                    )}`}
                </p>
            </div>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <ThreeDots videoId={video._id} />
            </button>
        </div>
    );
};

export default VideoTitle;
