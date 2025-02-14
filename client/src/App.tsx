import { AuthLayOut } from "./components/auth/auth-layout";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Home } from "./components/root/public/home";
import { SignIn } from "./components/auth/signin";
import { SignUp } from "./components/auth/signup";
import { Video } from "./components/root/public/video/video";
import { WatchHistory } from "./components/root/private/watch-history";
import { LikedVideos } from "./components/root/public/video/liked-videos";
import { MyVideos } from "./components/root/private/my-videos";
import { WatchLater } from "./components/root/private/watch-later";
import { PlayLists } from "./components/root/private/playlist/playlists";
import { Playlist } from "./components/root/private/playlist/playlist";
import { useSelector } from "react-redux";
import { Short } from "./components/root/public/short/short";
import { Subscriptions } from "./components/root/private/subscriptions";
import { SearchedVideos } from "./components/root/public/video/searched-videos";
import { ForgotPassword } from "./components/auth/forgot-password";
import { ResetPassword } from "./components/auth/reset-password";
import { useEffect } from "react";
import { RootState } from "./store/store";
import { PrivateLayout } from "./components/root/private/layout";
import { RootLayOut } from "./components/root/public/layout";
import { PlaylistNhistory } from "./components/root/private/playlist/playlist-and-history";
import { YourVideos } from "./components/root/private/your-videos";
import { StudioLayout } from "./components/studio/layout";
import { Channel } from "./components/root/public/channel/channel";
import { ContentVideos } from "./components/studio/channel/content/videos";
import { ContentPlaylists } from "./components/studio/channel/content/playlists";
import { ContentPosts } from "./components/studio/channel/content/posts";
import { ContentShorts } from "./components/studio/channel/content/shorts";
import { AnalyticsLayout } from "./components/studio/channel/analytics/layout";
import { CommunityLayout } from "./components/studio/channel/community/layout";
import { SubtitlesLayout } from "./components/studio/channel/subtitles/layout";
import { ContentLayout } from "./components/studio/channel/content/layout";
import { ChannelVideos } from "./components/root/public/channel/videos";
import { ChannelPlaylists } from "./components/root/public/channel/playlists";
import { ChannelShorts } from "./components/root/public/channel/shorts";
import { ChannelPosts } from "./components/root/public/channel/posts";
import { ChannelLayout } from "./components/studio/channel/layout";
import { ChannelHome } from "./components/root/public/channel/home";
import { Post } from "./components/root/public/post/post";
import { StudioVideo } from "./components/studio/video";
import { StudioShort } from "./components/studio/short";
import { StudioPost } from "./components/studio/post";
import { StudioPlaylist } from "./components/studio/playlist";

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
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
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
                        <Route
                            path="/watch-history"
                            element={<WatchHistory />}
                        />
                        <Route path="/liked-videos" element={<LikedVideos />} />
                        <Route path="/my-videos" element={<MyVideos />} />
                        <Route path="/watch-later" element={<WatchLater />} />
                        <Route path="/playlists" element={<PlayLists />} />
                        <Route path="/playlist/:id" element={<Playlist />} />
                        <Route
                            path="/playlist-n-history"
                            element={<PlaylistNhistory />}
                        />
                        <Route
                            path="/subscriptions"
                            element={<Subscriptions />}
                        />
                        <Route path="/your-videos" element={<YourVideos />} />
                    </Route>
                </Route>
                <Route element={<StudioLayout />} path="/studio">
                    <Route path=":username" element={<ChannelLayout />}>
                        <Route path="content" element={<ContentLayout />}>
                            <Route
                                index
                                element={<Navigate to="videos" replace />}
                            />
                            <Route path="videos" element={<ContentVideos />} />
                            <Route
                                path="playlists"
                                element={<ContentPlaylists />}
                            />
                            <Route path="posts" element={<ContentPosts />} />
                            <Route path="shorts" element={<ContentShorts />} />
                        </Route>
                        <Route path="analytics" element={<AnalyticsLayout />} />
                        <Route path="community" element={<CommunityLayout />} />
                        <Route path="subtitles" element={<SubtitlesLayout />} />
                    </Route>
                    <Route path="video/:id" element={<StudioVideo />} />
                    <Route path="short/:id" element={<StudioShort />} />
                    <Route path="post/:id" element={<StudioPost />} />
                    <Route path="playlist/:id" element={<StudioPlaylist />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
