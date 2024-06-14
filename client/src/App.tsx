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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                //public routes
                <Route element={<AuthLayOut />}>
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/register" element={<SignUp />} />
                </Route>
                //private routes
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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
