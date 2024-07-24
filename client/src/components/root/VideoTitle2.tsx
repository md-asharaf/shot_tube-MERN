import { IPlaylist } from "@/interfaces";
import { useNavigate } from "react-router-dom";

const VideoTitle2: React.FC<IPlaylist> = (playlist) => {
    const navigate = useNavigate();
    return (
        <div className="grid cursor-pointer">
            <span className="font-bold">{playlist.name}</span>
            <span
                className="text-sm text-zinc-600 hover:text-black"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${playlist.creator.username}/channel`);
                }}
            >{`${playlist.creator.fullname} • playlist`}</span>
            <span className="text-sm font-semibold text-gray-500 hover:text-black">
                view full playlist
            </span>
        </div>
    );
};

export default VideoTitle2;
