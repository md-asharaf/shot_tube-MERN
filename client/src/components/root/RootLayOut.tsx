import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import BigDrawer from "./BigDrawer";
import SmallDrawer from "./SmallDrawer";
import VideoProvider from "@/provider/video.slice";
import { useState } from "react";
import { IVideoData } from "@/interfaces";
const RootLayOut = () => {
    const [videos, setVideos] = useState([] as IVideoData[]);
    const addVideo = (video: IVideoData) => {
        setVideos((prev) => [...prev, video]);
    };
    const deleteVideo = (id: string) => {
        setVideos((prev) => prev.filter((video) => video._id != id));
    };
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    return (
        <VideoProvider value={{ videos, addVideo, deleteVideo, setVideos }}>
            <div className="h-screen w-screen">
                <header>
                    <nav>
                        <NavBar />
                    </nav>
                </header>
                <div className="flex py-20 pr-4 space-x-4 h-screen w-screen">
                    {isMenuOpen ? (
                        <div className="pl-6 min-w-44 hidden sm:block overflow-auto">
                            <BigDrawer />
                        </div>
                    ) : (
                        <div className="min-w-12 hidden sm:block overflow-auto">
                            <SmallDrawer />
                        </div>
                    )}
                    <div className="overflow-y-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </VideoProvider>
    );
};

export default RootLayOut;
