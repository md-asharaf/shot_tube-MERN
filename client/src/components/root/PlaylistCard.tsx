interface Props {
    playlistThumbnail: string;
    videosLength: number;
}
const PlaylistCard: React.FC<Props> = ({playlistThumbnail,videosLength}) => {
    if(!playlistThumbnail) return null;
    return (
        <div className="relative">
            <img
                src={
                    playlistThumbnail
                }
                className="w-full h-full aspect-video object-cover rounded-xl"
                loading="lazy"
            />
            <p className="absolute right-2 bottom-2 bg-black text-white text-xs font-bold py-1 px-2 rounded">
                {`${videosLength} videos`}
            </p>
        </div>
    );
};

export default PlaylistCard;
