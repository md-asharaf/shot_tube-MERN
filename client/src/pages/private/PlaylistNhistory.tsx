import { useSelector } from "react-redux";
import DefaultAvatarImage from "@/assets/images/profile.png";
import { IPlaylist, IVideoData } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import playlistServices from "@/services/Playlist";
import subscriptionServices from "@/services/Subscription";
import { Loader2 } from "lucide-react";
import userServices from "@/services/User";
import videoServices from "@/services/Video";
import { RootState } from "@/store/store";
import Library from "@/components/Library";

const PlaylistNhistory = () => {
  const userData = useSelector((state: RootState) => state.auth.userData);

  const { data: subscriberCount } = useQuery({
    queryKey: ["subscriberCount", userData?._id],
    queryFn: async (): Promise<number> => {
      const data = await subscriptionServices.getSubscribersCount(userData?._id);
      return data.subscribersCount;
    },
    enabled: !!userData,
  });

  const { data: watchHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["watch-history", userData?._id],
    queryFn: async (): Promise<IVideoData[]> => {
      const data = await userServices.getWatchHistory();
      return data.watchHistory;
    },
    enabled: !!userData,
  });

  const { data: playlists, isLoading: loadingPlaylists } = useQuery({
    queryKey: ["playlists", userData?._id],
    queryFn: async (): Promise<IPlaylist[]> => {
      const data = await playlistServices.getAllPlaylists(userData?._id);
      return data.playlists;
    },
    enabled: !!userData?._id,
  });

  const { data: watchLater, isLoading: loadingWatchLater } = useQuery({
    queryKey: ["watch-later", userData?._id],
    queryFn: async (): Promise<IVideoData[]> => {
      const data = await userServices.getWatchLater();
      return data.watchLater;
    },
    enabled: !!userData,
  });

  const { data: likedVideos, isLoading: loadingLikedVideos } = useQuery({
    queryKey: ["liked-videos", userData?._id],
    queryFn: async (): Promise<IVideoData[]> => {
      const data = await videoServices.likedVideos();
      return data.likedVideos;
    },
    enabled: !!userData?._id,
  });

  if (loadingHistory || loadingPlaylists || loadingWatchLater || loadingLikedVideos) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto space-y-6">
      <div className="hidden sm:flex items-center space-x-6">
        <img
          src={userData?.avatar || DefaultAvatarImage}
          alt="User Avatar"
          className="rounded-full h-32 w-32"
          loading="lazy"
        />
        <div className="space-y-2">
          <div className="font-bold text-3xl">{userData?.fullname}</div>
          <div className="text-muted-foreground">{`@${
            userData?.username
          } • ${subscriberCount} subscribers • ${
            watchHistory?.length || 0
          } videos`}</div>
        </div>
      </div>

      <div className="space-y-10">
        {watchHistory?.length > 0 && <Library videos={watchHistory} label="Watch History" />}
        {playlists?.length > 0 && <Library playlists={playlists} label="Playlists" />}
        {watchLater?.length > 0 && <Library videos={watchLater} label="Watch Later" />}
        {likedVideos?.length > 0 && <Library videos={likedVideos} label="Liked Videos" />}
      </div>
    </div>
  );
};

export default PlaylistNhistory;
