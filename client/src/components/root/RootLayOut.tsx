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
            <div className="h-screen w-screen bg-white dark:bg-black">
                <header>
                    <nav>
                        <NavBar />
                    </nav>
                </header>
                <main className="flex pt-20 pr-1 space-x-4 h-screen w-screen custom-scrollbar">
                    {isMenuOpen ? (
                        <div className="pl-6 min-w-44 hidden sm:block overflow-auto">
                            <BigDrawer />
                        </div>
                    ) : (
                        <div className="min-w-12 hidden sm:block overflow-auto">
                            <SmallDrawer />
                        </div>
                    )}
                    <div className="overflow-y-auto w-full mb-12 sm:mb-0">
                        <Outlet />
                    </div>
                </main>
                <div className="block sm:hidden">
                    <BottomBar />
                </div>
                <Toaster />
            </div>
        </VideoProvider>
    );
};

export default RootLayOut;
