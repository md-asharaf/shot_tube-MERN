import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../../ui/sidebar";
import StudioSidebar from "./studio-sidebar";
import StudioNavbar from "./studio-navbar";

export default function StudioLayout() {
    return (
        <SidebarProvider>
            <div className="w-full">
                <StudioNavbar />
                <div className="flex min-h-screen pt-[4rem]">
                    <StudioSidebar />
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
