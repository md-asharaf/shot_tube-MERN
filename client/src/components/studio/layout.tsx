import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "./sidebar/navbar";
import { Outlet } from "react-router-dom";

export const StudioLayout = () => {
    return (
        <SidebarProvider>
            <div className="w-full">
                <StudioNavbar />
                <Outlet />
            </div>
        </SidebarProvider>
    );
}
