import { Outlet } from "react-router-dom";
import { SidebarLayout } from "../sidebar/layout";
import { ChannelSection } from "./section";
export const ChannelLayout = () => {
    return (
        <div className="flex min-h-screen pt-[4rem]">
            <SidebarLayout>
                <ChannelSection />
            </SidebarLayout>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
