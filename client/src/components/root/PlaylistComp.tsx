import { Link } from "react-router-dom";
import { IVideoData } from "@/interfaces";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import ThreeDots from "./ThreeDots";
import { useMutation } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import likeServices from "@/services/like.services";
import { toast } from "react-toastify";
import ColorThief from "colorthief";
interface Props {
    playlist: {
        _id?: string;
        name: string;
        creator: string;
        updatedAt: Date;
        totalViews: number;
        videos: Array<IVideoData>;
        description: string;
    };
    refetch?: () => void;
}
const PlaylistComp: React.FC<Props> = ({ playlist, refetch = () => {} }) => {
    const [background, setBackground] = useState<string>("");

    useEffect(() => {
        if (playlist.videos.length === 0) return;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = playlist.videos[0].thumbnail;

        image.onload = () => {
            const colorThief = new ColorThief();
            try {
                const dominantColor = colorThief.getColor(image);
                if (dominantColor) {
                    const rgbColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
                    setBackground(rgbColor);
                } else {
                    setBackground("rgb(200, 200, 200)");
                }
            } catch (error) {
                console.error("Error extracting colors:", error);
                setBackground("rgb(200, 200, 200)");
            }
        };

        image.onerror = () => {
            console.error("Failed to load image.");
            setBackground("rgb(200, 200, 200)");
        };
    }, [playlist]);

    const { mutate: remove } = useMutation({
        mutationFn: async ({
            playlistId,
            videoId,
        }: {
            playlistId: string;
            videoId: string;
        }) => {
            await playlistServices.removeVideoFromPlaylist(videoId, playlistId);
        },
        onSuccess: () => {
            toast.success(`Removed from ${playlist.name}`);
            refetch();
            return true;
        },
    });
    const { mutate: toggleLike } = useMutation({
        mutationFn: async ({ videoId }: { videoId: string }) => {
            await likeServices.toggleLike(videoId, "video");
        },
        onSuccess: () => {
            toast.success("Removed from Liked Videos");
            refetch();
            return true;
        },
    });
    return (
        <div className="flex flex-col gap-4 lg:flex-row h-full  w-full dark:text-white">
            <div
                className="flex flex-col space-y-4 sm:space-x-4 sm:flex-row lg:flex-col dark:bg-zinc-700 bg-gray-200 p-5  rounded-xl lg:h-full lg:w-1/3 xl:w-1/4"
                style={{
                    background,
                }}
            >
                <img
                    src={playlist.videos[0].thumbnail}
                    alt="Playlist Thumbnail"
                    className="object-cover aspect-video sm:w-1/2 lg:w-full rounded-lg hover:opacity-50"
                    loading="lazy"
                />

                <div className="space-y-3">
                    <h1 className="text-2xl font-bold truncate">
                        {playlist.name}
                    </h1>
                    <p className="text-gray-500 text-sm truncate">
                        {playlist.creator}
                    </p>
                    <p className="text-xs text-gray-400">
                        {`${playlist.videos?.length} videos • ${
                            playlist.totalViews
                        } views • Last updated on ${new Date(
                            playlist.updatedAt
                        ).toDateString()}`}
                    </p>

                    <div className="flex justify-between gap-2 w-full">
                        <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors py-2 px-4 rounded-full w-1/2">
                            Play all
                        </Button>
                        <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors py-2 px-4 rounded-full w-1/2">
                            Shuffle
                        </Button>
                    </div>

                    <p className="text-sm text-gray-500">
                        {playlist.description}
                    </p>
                </div>
            </div>

            <div className="flex flex-col w-full lg:w-2/3 xl:w-3/4">
                {playlist.videos?.map((video, index) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex items-start p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition duration-200 ease-in-out">
                            <div className="text-gray-500 text-xl mr-2 font-semibold">
                                {index + 1}
                            </div>

                            <div className="relative w-36 h-24 sm:w-44 sm:h-28 flex-shrink-0">
                                <img
                                    src={video.thumbnail}
                                    alt={`Thumbnail of ${video.title}`}
                                    className="h-full w-full object-cover aspect-video rounded-lg"
                                    loading="lazy"
                                />
                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs rounded">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>

                            <div className="flex-1 ml-4 overflow-hidden">
                                <h3 className="text-lg text-black dark:text-white truncate">
                                    {video.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {`${video.creator.fullname} • ${
                                        video.views
                                    } views • ${formatDistanceToNowStrict(
                                        new Date(video.createdAt)
                                    ).replace("about", "")} ago`}
                                </p>
                            </div>
                            <ThreeDots
                                videoId={video._id}
                                task={
                                    playlist.name === "Watch Later"
                                        ? null
                                        : {
                                              title: `Remove from ${playlist.name}`,
                                              handler: () =>
                                                  playlist._id
                                                      ? remove({
                                                            playlistId:
                                                                playlist._id,
                                                            videoId: video._id,
                                                        })
                                                      : toggleLike({
                                                            videoId: video._id,
                                                        }),
                                          }
                                }
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PlaylistComp;
