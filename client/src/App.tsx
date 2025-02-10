import AuthLayOut from "./components/layouts/AuthLayout";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/public/Home";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Video from "./pages/public/Video";
import WatchHistory from "./pages/private/WatchHistory";
import LikedVideos from "./pages/private/LikedVideos";
import MyVideos from "./pages/private/MyVideos";
import WatchLater from "./pages/private/WatchLater";
import PlayLists from "./pages/private/PlayLists";
import Playlist from "./pages/private/Playlist";
import { useSelector } from "react-redux";
import Short from "./pages/public/Short";
import Subscriptions from "./pages/private/Subscriptions";
import SearchedVideos from "./pages/public/SearchedVideos";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { useEffect } from "react";
import { RootState } from "./store/store";
import PrivateLayout from "./components/layouts/PrivateLayout";
import RootLayOut from "./components/layouts/RootLayOut";
import PlaylistNhistory from "./pages/private/PlaylistNhistory";
import YourVideos from "./components/YourVideos";
import StudioLayout from "./components/studio/sidebar/studio-layout";
import User from "./pages/public/User";
import { StudioVideos } from "./components/studio/content/studio-videos";
import { StudioPlaylists } from "./components/studio/content/studio-playlists";
import { StudioPosts } from "./components/studio/content/studio-posts";
import { StudioShorts } from "./components/studio/content/studio-shorts";
import { Analytics } from "./components/studio/analytics";
import { Community } from "./components/studio/community";
import { Subtitles } from "./components/studio/subtitles";
import { Content } from "./components/studio/content/content";
import { Videos } from "./components/user/videos";
import { Playlists } from "./components/user/playlists";
import { Shorts } from "./components/user/shorts";
import { Posts } from "./components/user/posts";
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
                        element={<ForgetPassword />}
                    />
                    <Route
                        path="/reset-password/:resetToken"
                        element={<ResetPassword />}
                    />
                </Route>
                <Route element={<RootLayOut />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/video" element={<Video />} />
                    <Route path="/short" element={<Short />} />
                    <Route path="/results" element={<SearchedVideos />} />
                    <Route path="/users/:username" element={<User />}>
                        <Route path="videos" element={<Videos />} />
                        <Route path="playlists" element={<Playlists />} />
                        <Route path="shorts" element={<Shorts />} />
                        <Route path="posts" element={<Posts />} />
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
                        <Route path="/playlist" element={<Playlist />} />
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
                <Route element={<StudioLayout />} path="/studio/:username">
                    <Route path="content" element={<Content />}>
                        <Route path="videos" element={<StudioVideos />} />
                        <Route path="playlists" element={<StudioPlaylists />} />
                        <Route path="posts" element={<StudioPosts />} />
                        <Route path="shorts" element={<StudioShorts />} />
                    </Route>
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="community" element={<Community />} />
                    <Route path="subtitles" element={<Subtitles />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
