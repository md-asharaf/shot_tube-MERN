import {
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar";
import { MainSection } from "./main-section";

export default function AppSidebar() {
    
    return (
        <Sidebar className="pt-16 z-40" collapsible="icon">
            <SidebarContent className="bg-background">
                <MainSection/>
            </SidebarContent>
        </Sidebar>
    );
}
