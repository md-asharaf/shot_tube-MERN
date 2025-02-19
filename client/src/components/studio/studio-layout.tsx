import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "./sidebar/studio-navbar";
import { Navigate, Outlet } from "react-router-dom";
import UploadVideo from "../root/modals/video-upload";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const StudioLayout = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);
    if(!userData) return <Navigate to="/login"/>
    return (
        <SidebarProvider>
            <div className="w-full overflow-y-auto h-screen">
                <StudioNavbar />
                <Outlet />
                <UploadVideo/>
            </div>
        </SidebarProvider>
    );
}
