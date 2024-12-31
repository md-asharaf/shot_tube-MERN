import AuthLayOut from "./components/auth/AuthLayOut";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import RootLayOut from "./components/root/RootLayOut";
import Home from "./pages/Home";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import Video from "./pages/Video";
import Channel from "./pages/Channel";
import WatchHistory from "./pages/WatchHistory";
import LikedVideos from "./pages/LikedVideos";
import MyVideos from "./pages/MyVideos";
import WatchLater from "./pages/WatchLater";
import PlayLists from "./pages/PlayLists";
import Playlist from "./pages/Playlist";
import { useSelector } from "react-redux";
import { RootState } from "./provider";
import PlaylistNhistory from "./pages/PlaylistNhistory";
import Shorts from "./pages/Shorts";
import Subscriptions from "./pages/Subscriptions";
import YourVideos from "./components/root/YourVideos";
import SearchedVideos from "./pages/SearchedVideos";
import ForgetPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";
import { useEffect } from "react";

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
                    <Route path="/videos/:videoId" element={<Video />} />
                    <Route path="/:username/channel" element={<Channel />} />
                    <Route path="/watch-history" element={<WatchHistory />} />
                    <Route path="/liked-videos" element={<LikedVideos />} />
                    <Route path="/my-videos" element={<MyVideos />} />
                    <Route path="/watch-later" element={<WatchLater />} />
                    <Route path="/playlists" element={<PlayLists />} />
                    <Route
                        path="/playlist/:playlistId"
                        element={<Playlist />}
                    />
                    <Route
                        path="/:username/playlist-n-history"
                        element={<PlaylistNhistory />}
                    />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/shorts" element={<Shorts />} />
                    <Route path="/your-videos" element={<YourVideos />} />
                    <Route path="/search" element={<SearchedVideos />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
