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
            <div className="w-screen bg-white dark:bg-black h-screen flex flex-col">
                <nav className="fixed top-0 left-0 h-12 sm:h-16 w-full">
                    <NavBar />
                </nav>
                <div className="flex flex-1 overflow-hidden sm:px-1 mt-12 sm:mt-16">
                    <div className="hidden sm:flex">
                        {isMenuOpen ? <BigDrawer /> : <SmallDrawer />}
                    </div>
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{
                            paddingBottom: "3rem", // Height of BottomBar
                            WebkitOverflowScrolling: "touch", // Smooth scrolling for iOS and mobile
                        }}
                    >
                        <Outlet />
                    </div>
                </div>
                <div className="sm:hidden h-12 fixed bottom-0 left-0 w-full">
                    <BottomBar />
                </div>
                <Toaster />
            </div>
        </VideoProvider>
    );
};

export default RootLayOut;
