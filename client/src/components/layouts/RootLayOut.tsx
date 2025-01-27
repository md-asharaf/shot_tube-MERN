import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import BottomBar from "../BottomBar";
import LoginPopover from "../popups/LoginPopover";
import VideoUpload from "../popups/VideoUpload";
import Drawer from "../Drawer";
import useSocketNotifications from "@/hooks/use-notification";
import SharePopup from "../popups/sharePopup";
const RootLayOut = () => {
    useSocketNotifications();
    return (
        <div className="w-screen bg-white dark:bg-black h-screen flex flex-col">
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
        </div>
    );
};

export default RootLayOut;
