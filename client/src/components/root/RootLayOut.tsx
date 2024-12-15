import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import BigDrawer from "./BigDrawer";
import SmallDrawer from "./SmallDrawer";
import VideoProvider from "@/provider/video.slice";
import { useState } from "react";
import { Toaster } from "../ui/toaster";
import BottomBar from "./BottomBar";
const RootLayOut = () => {
    const [query, setQuery] = useState("");
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    return (
        <VideoProvider value={{ query, setQuery }}>
            <div className={`w-screen bg-white dark:bg-black h-screen`}>
                <nav className="h-20">
                    <NavBar />
                </nav>
                <div className="flex sm:px-1">
                    <div className="hidden sm:flex">
                        {isMenuOpen ? <BigDrawer /> : <SmallDrawer />}
                    </div>
                    <div className="flex-1 overflow-y-auto h-[calc(100vh-5rem)]" >
                        <Outlet />
                    </div>
                </div>
                <div className="sm:hidden">
                    <BottomBar />
                </div>
                <Toaster />
            </div>
        </VideoProvider>
    );
};

export default RootLayOut;
