import { IPlaylist } from "@/interfaces";

const PlaylistDetails: React.FC<IPlaylist> = (playlist) => {
    const totalViews = playlist.videos.reduce(
        (prev, curr) => prev + curr.views,
        0
    );
    const totalVideos = playlist.videos.length;
    return (
        <div className="p-3 rounded-xl shadow-lg">
            <img
                src={playlist.videos[0].thumbnail.url}
                alt="playlist tumbnail"
                className="rounded-xl"
            />
            <div className="text-wrap text-2xl">{playlist.name}</div>
            <span className="text-xs">{playlist.creator.fullname}</span>
            <div className="flex space-x-2 text-xs">
                <div>{`${totalVideos} videos`}</div>
                <div>{`${totalViews} views`}</div>
                <div></div>
            </div>
        </div>
    );
};

export default PlaylistDetails;
