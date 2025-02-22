import { AuthLayOut } from "./components/auth/auth-layout";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Home } from "./components/root/home/home";
import { SignIn } from "./components/auth/signin";
import { SignUp } from "./components/auth/signup";
import { Video } from "./components/root/video/video";
import { WatchHistory } from "./components/root/watch-history";
import { LikedVideos } from "./components/root/video/liked-videos";
import { MyVideos } from "./components/root/my-videos";
import { WatchLater } from "./components/root/watch-later";
import { PlayLists } from "./components/root/playlist/playlists";
import { Playlist } from "./components/root/playlist/playlist";
import { useSelector } from "react-redux";
import { Short } from "./components/root/short/short";
import { Subscriptions } from "./components/root/subscriptions";
import { SearchedVideos } from "./components/root/video/searched-videos";
import { ForgotPassword } from "./components/auth/forgot-password";
import { ResetPassword } from "./components/auth/reset-password";
import { useEffect } from "react";
import { RootState } from "./store/store";
import { PrivateLayout } from "./components/root/private-layout";
import { RootLayOut } from "./components/root/public-layout";
import { PlaylistNhistory } from "./components/root/playlist-and-history";
import { YourVideos } from "./components/root/your-videos";
import { StudioLayout } from "./components/studio/studio-layout";
import { Channel } from "./components/root/channel/channel-layout";
import { ContentVideos } from "./components/studio/channel/content/content-videos";
import { ContentPlaylists } from "./components/studio/channel/content/content-playlists";
import { ContentPosts } from "./components/studio/channel/content/content-posts";
import { ContentShorts } from "./components/studio/channel/content/content-shorts";
import { AnalyticsLayout } from "./components/studio/channel/analytics/analytics-layout";
import { CommunityLayout } from "./components/studio/channel/community/community-layout";
import { SubtitlesLayout } from "./components/studio/channel/subtitles/subtitles-layout";
import { ContentLayout } from "./components/studio/channel/content/content-layout";
import { ChannelVideos } from "./components/root/channel/channel-videos";
import { ChannelPlaylists } from "./components/root/channel/channel-playlists";
import { ChannelShorts } from "./components/root/channel/channel-shorts";
import { ChannelPosts } from "./components/root/channel/channel-posts";
import { ChannelLayout } from "./components/studio/channel/channel-layout";
import { ChannelHome } from "./components/root/channel/channel-home";
import { Post } from "./components/root/post/post";
import { StudioVideo } from "./components/studio/video";
import { StudioShort } from "./components/studio/short";
import { StudioPost } from "./components/studio/post";
import { StudioPlaylist } from "./components/studio/playlist";
import { VideoAnalytics } from "./components/studio/video/video-analytics";
import { VideoComments } from "./components/studio/video/video-comments";
import { VideoDetails } from "./components/studio/video/video-details";
import { ShortComments } from "./components/studio/short/short-comments";
import { ShortAnalytics } from "./components/studio/short/short-analytics";
import { ShortDetails } from "./components/studio/short/short-details";
import { VideoSubtitles } from "./components/studio/video/video-subtitles";
import { ShortSubtitles } from "./components/studio/short/short-subtitles";
import { PlaylistVideos } from "./components/studio/playlist/playlist-videos";
import { PlaylistAnalytics } from "./components/studio/playlist/playlist-analytics";
import { PlaylistDetails } from "./components/studio/playlist/playlist-details";
import { PostComments } from "./components/studio/post/post-comments";
import { PostDetails } from "./components/studio/post/post-details";

function App() {
  const theme = useSelector((state: RootState) => state.theme.mode);
  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
  }, [theme]);
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayOut />}>
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />
        </Route>
        <Route path="/" element={<RootLayOut />}>
          <Route path="" element={<Home />} />
          <Route path="video/:id" element={<Video />} />
          <Route path="short/:id" element={<Short />} />
          <Route path="post/:id" element={<Post />} />
          <Route path="results" element={<SearchedVideos />} />
          <Route path="channel/:username" element={<Channel />}>
            <Route path="" element={<ChannelHome />} />
            <Route path="videos" element={<ChannelVideos />} />
            <Route path="playlists" element={<ChannelPlaylists />} />
            <Route path="shorts" element={<ChannelShorts />} />
            <Route path="posts" element={<ChannelPosts />} />
          </Route>
          <Route element={<PrivateLayout />}>
            <Route path="/watch-history" element={<WatchHistory />} />
            <Route path="/liked-videos" element={<LikedVideos />} />
            <Route path="/my-videos" element={<MyVideos />} />
            <Route path="/watch-later" element={<WatchLater />} />
            <Route path="/playlists" element={<PlayLists />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/playlist-n-history" element={<PlaylistNhistory />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/your-videos" element={<YourVideos />} />
          </Route>
        </Route>
        <Route element={<StudioLayout />} path="/studio">
          <Route path=":username" element={<ChannelLayout />}>
            <Route path="content" element={<ContentLayout />}>
              <Route index element={<Navigate to="videos" replace />} />
              <Route path="videos" element={<ContentVideos />} />
              <Route path="playlists" element={<ContentPlaylists />} />
              <Route path="posts" element={<ContentPosts />} />
              <Route path="shorts" element={<ContentShorts />} />
            </Route>
            <Route path="analytics" element={<AnalyticsLayout />} />
            <Route path="community" element={<CommunityLayout />} />
            <Route path="subtitles" element={<SubtitlesLayout />} />
          </Route>
          <Route path="video/:id" element={<StudioVideo />}>
            <Route index element={<Navigate to="edit" replace />} />
            <Route path="comments" element={<VideoComments />} />
            <Route path="analytics" element={<VideoAnalytics />} />
            <Route path="edit" element={<VideoDetails />} />
            <Route path="subtitles" element={<VideoSubtitles />} />
          </Route>
          <Route path="post/:id" element={<StudioPost />}>
            <Route path="comments" element={<PostComments />} />
            <Route path="edit" element={<PostDetails />} />
          </Route>
          <Route path="short/:id" element={<StudioShort />}>
            <Route index element={<Navigate to="edit" replace />} />
            <Route path="comments" element={<ShortComments />} />
            <Route path="edit" element={<ShortDetails />} />
            <Route path="analytics" element={<ShortAnalytics />} />
            <Route path="subtitles" element={<ShortSubtitles />} />
          </Route>
          <Route path="playlist/:id" element={<StudioPlaylist />}>
            <Route path="videos" element={<PlaylistVideos />} />
            <Route path="analytics" element={<PlaylistAnalytics />} />
            <Route path="edit" element={<PlaylistDetails />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
