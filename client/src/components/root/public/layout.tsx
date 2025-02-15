import { Outlet } from "react-router-dom";
import { NavBar } from "@/components/root/navbar";
import { BottomBar } from "@/components/root/bottom-bar";
import LoginPopover from "@/components/root/public/modals/login-popover";
import VideoUpload from "@/components/root/public/modals/video-upload";
import { Drawer } from "@/components/root/drawer/drawer";
import useSocketNotifications from "@/hooks/use-notification";
import { SharePopup } from "@/components/root/public/modals/share-popup";
import { SaveToPlaylist } from "@/components/root/public/modals/save-to-playlist";
import { CreatePlaylist } from "@/components/root/public/modals/create-playlist";
import { GlobalAlertDialog } from "./modals/global-alert-dialog";
export const RootLayOut = () => {
    useSocketNotifications();
    return (
        <div className="w-screen bg-white dark:bg-[#0F0F0F] h-screen flex flex-col">
            <nav className="z-30 fixed top-0 left-0 h-12 sm:h-16 w-full">
                <NavBar />
            </nav>
            <div className="flex flex-1 overflow-hidden mt-12 sm:mt-16 sm:space-x-4">
                <Drawer />
                <div
                    className="flex-1 overflow-y-auto pt-1"
                    style={{
                        paddingBottom: "38px",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Outlet />
                </div>
            </div>
            <div className="sm:hidden fixed bottom-0 z-10 left-0 w-full">
                <BottomBar />
            </div>
            <LoginPopover />
            <VideoUpload />
            <SharePopup />
            <SaveToPlaylist />
            <CreatePlaylist />
            <GlobalAlertDialog/>
        </div>
    );
};
