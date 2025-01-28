import { IPlaylist, IVideoData } from "@/interfaces";
import { useSelector } from "react-redux";
import PlaylistCard from "@/components/PlaylistCard";
import VideoTitle2 from "@/components/VideoTitle2";
import { Link } from "react-router-dom";
import playlistServices from "@/services/Playlist";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import videoServices from "@/services/Video";
import userServices from "@/services/User";
import { RootState } from "@/store/store";

const PlayLists = () => {
  const userData = useSelector((state: RootState) => state.auth?.userData);
  const {
    data: playlists,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["playlists", userData?._id],
    queryFn: async (): Promise<IPlaylist[]> => {
      const data = await playlistServices.getAllPlaylists(userData?._id);
      return data.playlists;
    },
    enabled: !!userData?._id,
  });
  const { data: likedVideos } = useQuery({
    queryKey: ["liked-videos", userData?._id],
    queryFn: async (): Promise<IVideoData[]> => {
      const data = await videoServices.likedVideos();
      return data.likedVideos;
    },
    enabled: !!userData?._id,
  });
  const { data: watchLaterVideos } = useQuery({
    queryKey: ["watch-later", userData?._id],
    queryFn: async (): Promise<IVideoData[]> => {
      const data = await userServices.getWatchLater();
      return data.watchLater;
    },
    enabled: !!userData?._id,
  });
  if (isLoading) {
    return (
      <div className="flex w-[90%] justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }
  if (isError) return <div>Error: {error.message}</div>;
  return (
    <div className="px-2 text-foreground w-full">
      <h1 className="text-2xl sm:text-3xl mb-3">
        {playlists?.length > 0 ? "Playlists" : "No playlists yet"}
      </h1>
      <hr />
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2">
        {playlists?.map((playlist) => (
          <Link
            to={`/playlist?p=${playlist._id}`}
            key={playlist._id}
            className="space-y-2 rounded-xl p-2 hover:bg-muted"
          >
            <PlaylistCard
              playlistThumbnail={
                playlist.videos.length > 0
                  ? playlist.videos[0].thumbnail
                  : null
              }
              videosLength={playlist.videos.length}
            />
            <VideoTitle2
              playlistName={playlist.name}
              username={playlist.creator.username}
              fullname={playlist.creator.fullname}
            />
          </Link>
        ))}
        {likedVideos && (
          <Link
            to="/liked-videos"
            className="space-y-2 rounded-xl p-2 hover:bg-muted"
          >
            <PlaylistCard
              playlistThumbnail={
                likedVideos.length > 0
                  ? likedVideos[0].thumbnail
                  : null
              }
              videosLength={likedVideos.length}
            />
            <VideoTitle2
              playlistName="Liked Videos"
              username={userData?.username}
              fullname={userData?.fullname}
            />
          </Link>
        )}
        {watchLaterVideos && (
          <Link
            to="/watch-later"
            className="space-y-2 rounded-xl p-2 hover:bg-muted"
          >
            <PlaylistCard
              playlistThumbnail={
                watchLaterVideos.length > 0
                  ? watchLaterVideos[0].thumbnail
                  : null
              }
              videosLength={watchLaterVideos.length}
            />
            <VideoTitle2
              playlistName="Watch Later"
              username={userData?.username}
              fullname={userData?.fullname}
            />
          </Link>
        )}
      </div>
    </div>
  );
};

export default PlayLists;
