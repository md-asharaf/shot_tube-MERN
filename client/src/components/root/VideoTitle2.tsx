import { IPlaylist } from "@/interfaces";
import { useNavigate } from "react-router-dom";

const VideoTitle2: React.FC<IPlaylist> = (playlist) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col cursor-pointer dark:text-white">
            <span className="font-bold">{playlist.name}</span>
            <span
                className="text-sm text-zinc-600 dark:text-zinc-300 hover:dark:text-white hover:text-black"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${playlist.creator.username}/channel`);
                }}
            >{`${playlist.creator.fullname} • playlist`}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:dark:text-white hover:text-black">
                view full playlist
            </span>
        </div>
    );
};

export default VideoTitle2;
