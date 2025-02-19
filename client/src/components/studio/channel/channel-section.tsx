import {
    ChartNoAxesCombined,
    LayoutDashboard,
    SubtitlesIcon,
    VideoIcon,
} from "lucide-react";
import { RiUserCommunityFill } from "react-icons/ri";
import { Option, SidebarGroupLayout } from "../sidebar/sidebar-group-layout";
import { UserSection } from "./user-section";
export const ChannelSection = () => {
    const items: Option[] = [
        {
            title: "Dashboard",
            url: ``,
            icon: LayoutDashboard,
        },
        ,
        {
            title: "Content",
            url: `content`,
            icon: VideoIcon,
        },
        ,
        {
            title: "Analytics",
            url: `analytics`,
            icon: ChartNoAxesCombined,
        },
        ,
        {
            title: "Community",
            url: `community`,
            icon: RiUserCommunityFill,
        },

        {
            title: "Subtitles",
            url: `subtitles`,
            icon: SubtitlesIcon,
        },
    ];
    return (
        <SidebarGroupLayout options={items}>
            <UserSection />
        </SidebarGroupLayout>
    )
};