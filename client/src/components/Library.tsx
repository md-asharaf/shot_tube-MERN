import { IVideoData, IPlaylist } from "@/interfaces";
import { Link } from "react-router-dom";
import VideoCard from "./VideoCard";
import VideoTitle from "./VideoTitle";
import PlaylistCard from "./PlaylistCard";
import VideoTitle2 from "./VideoTitle2";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

const Library = ({
  videos = null,
  playlists = null,
  label,
}: {
  videos?: IVideoData[];
  playlists?: IPlaylist[];
  label: string;
}) => {
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
            {videos ? (
              videos.map((video) => (
                <CarouselItem key={video._id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
                  <Link
                    to={`/video?v=${video._id}`}
                    className="flex flex-col gap-2 hover:bg-muted rounded-lg p-2"
                  >
                    <VideoCard
                      thumbnail={video.thumbnail}
                      duration={video.duration}
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
                </CarouselItem>
              ))
            ) : (
              playlists?.map((playlist) => (
                <CarouselItem key={playlist._id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
                  <Link
                    to={`/playlist?p=${playlist._id}`}
                    className="flex flex-col gap-2 hover:bg-muted rounded-lg p-2"
                  >
                    <PlaylistCard
                      playlistThumbnail={
                        playlist.videos?.length > 0
                          ? playlist.videos[0].thumbnail
                          : null
                      }
                      videosLength={playlist.videos?.length || 0}
                    />
                    <VideoTitle2
                      playlistName={playlist.name}
                      username={playlist.creator.username}
                      fullname={playlist.creator.fullname}
                    />
                  </Link>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="left-0 top-1/3 -translate-x-1/3" />
          <CarouselNext className="right-0 top-1/3 translate-x-1/3" />
        </Carousel>
      </div>
    </div>
  );
};

export default Library;

