import { IPlaylist } from "@/interfaces";

const PlaylistCard: React.FC<IPlaylist> = (playlist) => {
    if (playlist.videos.length === 0) return null;
    return (
        <div className="relative h-2/3">
            <img
                src={
                    playlist.videos.length > 0
                        ? playlist.videos[0].thumbnail.url
                        : ""
                }
                alt="Video thumbnail"
                className="w-full h-full rounded-xl"
            />
            <p className="absolute right-2 bottom-2 bg-black text-white text-xs font-bold py-1 px-2 rounded">
                {`${playlist.videos.length} videos`}
            </p>
        </div>
    );
};

export default PlaylistCard;
