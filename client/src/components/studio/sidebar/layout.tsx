import { Sidebar, SidebarContent } from "../../ui/sidebar";

export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Sidebar className="pt-16 z-40" collapsible="icon">
            <SidebarContent className="bg-background">
                {children}
            </SidebarContent>
        </Sidebar>
    );
};
