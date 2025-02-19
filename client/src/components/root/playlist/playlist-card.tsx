interface Props {
    playlistThumbnail: string;
    videosLength: number;
}

export const PlaylistCard: React.FC<Props> = ({ playlistThumbnail, videosLength }) => {
    return (
        <div className="relative">
            <img
                src={playlistThumbnail}
                className="w-full aspect-video object-cover rounded-xl"
                loading="lazy"
                alt="Empty playlist"
            />
            <p className="absolute right-2 bottom-2 bg-black text-white text-xs font-bold py-1 px-2 rounded">
                {`${videosLength || 0} videos`}
            </p>
        </div>
    );
};

