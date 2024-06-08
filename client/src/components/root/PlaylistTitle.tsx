import { IPlaylist } from "@/interfaces";
import { Link, useNavigate } from "react-router-dom";

const PlaylistTitle: React.FC<IPlaylist> = (playlist) => {
    const navigate = useNavigate();
    return (
        <Link to="/playlists/videos">
            <div className="grid h-1/3 cursor-pointer">
                <span className="font-bold">{playlist.name}</span>
                <span
                    className="text-sm hover:text-black"
                    onClick={() =>
                        navigate(`/${playlist.creator.username}/channel`)
                    }
                >{`${playlist.creator.fullname} • playlist`}</span>
                <span className="text-sm font-semibold text-gray-500 hover:text-black">
                    view full playlist
                </span>
            </div>
        </Link>
    );
};

export default PlaylistTitle;
