import { useRef } from "react";
import { IVideoData } from "@/interfaces";
import { IPlaylist } from "@/interfaces";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import VideoCard from "./VideoCard";
import VideoTitle from "./VideoTitle";
import PlaylistCard from "./PlaylistCard";
import VideoTitle2 from "./VideoTitle2";

const Library = ({
    videos = null,
    playlists = null,
}: {
    videos?: IVideoData[];
    playlists?: IPlaylist[];
}) => {
    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        carouselRef.current?.scrollBy({
            left: -carouselRef.current.clientWidth,
            behavior: "smooth",
        });
    };

    const scrollRight = () => {
        carouselRef.current?.scrollBy({
            left: carouselRef.current.clientWidth,
            behavior: "smooth",
        });
    };

    return (
        <div className="dark:text-white space-y-4 px-4">
            <div className="flex justify-between">
                <div className="text-2xl">
                    {videos ? "History" : "Playlists"}
                </div>
                {videos && (
                    <Link to="/watch-history">
                        <button className="rounded-full bg-white dark:bg-black text-black shadow-none border-zinc-400 border-[1px] dark:text-white dark:border-[1px] dark:border-zinc-600 py-2 px-3">
                            View all
                        </button>
                    </Link>
                )}
            </div>
            <div className="relative">
                <button
                    onClick={scrollLeft}
                    className="rounded-full bg-black hidden sm:block absolute left-1 top-1/3 transform -translate-y-1/2 text-white p-[10px] z-10"
                >
                    <FaChevronLeft />
                </button>

                {videos ? (
                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto gap-4 scrollbar-hide"
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {videos.map((video) => (
                            <Link
                                to={`/videos/${video._id}`}
                                key={video._id}
                                className="flex gap-2 flex-col min-w-[294px] max-w-[294px]"
                            >
                                <VideoCard
                                    thumbnail={video.thumbnail}
                                    duration={video.duration}
                                    className="group-hover:rounded-none"
                                />
                                <VideoTitle
                                    video={{
                                        _id: video._id,
                                        title: video.title,
                                        views: video.views,
                                        createdAt: video.createdAt,
                                    }}
                                    creator={{
                                        fullname: video.creator.fullname,
                                        username: video.creator.username,
                                        avatar: video.creator.avatar,
                                    }}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div
                        ref={carouselRef}
                        className="flex flex-col sm:flex-row sm:overflow-x-auto gap-4 scrollbar-hide"
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {playlists?.map((playlist) => (
                            <Link
                                to={`/playlist/${playlist._id}`}
                                key={playlist._id}
                                className="flex sm:flex-col gap-x-6 sm:gap-y-2 min-w-full sm:min-w-[294px] sm:max-w-[294px]"
                            >
                                <div className="w-1/2 sm:w-full">
                                    <PlaylistCard
                                        playlistThumbnail={
                                            playlist.videos?.length > 0
                                                ? playlist.videos[0].thumbnail
                                                : null
                                        }
                                        videosLength={
                                            playlist.videos?.length || 0
                                        }
                                    />
                                </div>
                                <VideoTitle2
                                    playlistName={playlist.name}
                                    username={playlist.creator.username}
                                    fullname={playlist.creator.fullname}
                                />
                            </Link>
                        ))}
                    </div>
                )}
                <button
                    onClick={scrollRight}
                    className="hidden sm:flex absolute bg-black rounded-full right-1 top-1/3 transform -translate-y-1/2 text-white p-3 items-center text-center z-10"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default Library;
