import { useNavigate } from "react-router-dom";
interface Props {
    playlistName: string;
    username: string;
    fullname: string;
}
export const VideoTitle2: React.FC<Props> = ({
    playlistName,
    username,
    fullname,
}) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col cursor-pointer dark:text-white">
            <span className="font-bold">{playlistName}</span>
            <span
                className="text-sm text-zinc-600 dark:text-zinc-300 hover:dark:text-white hover:text-black"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/channel/${username}`);
                }}
            >{`${fullname} • playlist`}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:dark:text-white hover:text-black">
                View full playlist
            </span>
        </div>
    );
};
