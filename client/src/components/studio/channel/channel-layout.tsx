import { Outlet } from "react-router-dom";
import { SidebarLayout } from "../sidebar/sidebar-layout";
import { ChannelSection } from "./channel-section";
export const ChannelLayout = () => {
    return (
        <div className="flex h-screen pt-[4rem]">
            <SidebarLayout>
                <ChannelSection />
            </SidebarLayout>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
