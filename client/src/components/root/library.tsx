import { IVideoData, IPlaylist, Playlist } from "@/interfaces";
import { Link } from "react-router-dom";
import { VideoCard } from "@/components/root/video/video-card";
import { VideoTitle2 } from "@/components/root/video/video-title2";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from "react";
import { PlaylistCard } from "./playlist/playlist-card";

export const Library = ({
    videos = null,
    playlists = null,
    label,
}: {
    videos?: IVideoData[];
    playlists?: Playlist[];
    label: string;
}) => {
    const playerRef = useRef(null);
    return (
        <div className="space-y-4 px-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{label}</h2>
                <Link to={`/${label.toLowerCase().split(" ").join("-")}`}>
                    <Button variant="outline" className="rounded-full">
                        View all
                    </Button>
                </Link>
            </div>
            <hr />
            <div className="relative">
                <Carousel className="w-full">
                    <CarouselContent>
                        {videos
                            ? videos.map((video) => (
                                  <CarouselItem
                                      key={video._id}
                                      className="pl-4 basis-10/12 sm:basis-1/2 md:basis-1/3 lg:basis-1/4  2xl:basis-1/5"
                                  >
                                      <Link
                                          to={`/video/${video._id}`}
                                          className="flex flex-col gap-2 rounded-lg"
                                      >
                                          <VideoCard
                                              video={video}
                                              playerRef={playerRef}
                                          />
                                      </Link>
                                  </CarouselItem>
                              ))
                            : playlists?.map((playlist) => (
                                  <CarouselItem
                                      key={playlist._id}
                                      className="pl-4 basis-10/12 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 2xl:basis-1/5"
                                  >
                                      <Link
                                          to={`/playlist/${playlist._id}`}
                                          className="flex flex-col gap-2 rounded-lg"
                                      >
                                          <PlaylistCard
                                              playlistThumbnail={
                                                  playlist.thumbnail
                                              }
                                              videosLength={
                                                  playlist.videos?.length || 0
                                              }
                                          />
                                          <VideoTitle2
                                              playlistName={playlist.name}
                                              username={
                                                  playlist.creator.username
                                              }
                                              fullname={
                                                  playlist.creator.fullname
                                              }
                                          />
                                      </Link>
                                  </CarouselItem>
                              ))}
                    </CarouselContent>
                    <CarouselPrevious
                        className="left-0 top-1/3 -translate-x-1/3"
                        hidden
                    />
                    <CarouselNext
                        className="right-0 top-1/3 translate-x-1/3"
                        hidden
                    />
                </Carousel>
            </div>
        </div>
    );
};
