import AuthLayOut from "./components/layouts/AuthLayOut";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/public/Home";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Video from "./pages/public/Video";
import Channel from "./pages/public/Channel";
import WatchHistory from "./pages/private/WatchHistory";
import LikedVideos from "./pages/private/LikedVideos";
import MyVideos from "./pages/private/MyVideos";
import WatchLater from "./pages/private/WatchLater";
import PlayLists from "./pages/private/PlayLists";
import Playlist from "./pages/private/Playlist";
import { useSelector } from "react-redux";
import Shorts from "./pages/public/Shorts";
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
                    <Route path="/short" element={<Shorts />} />
                    <Route path="/results" element={<SearchedVideos />} />
                    <Route path="/channel" element={<Channel />} />
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
