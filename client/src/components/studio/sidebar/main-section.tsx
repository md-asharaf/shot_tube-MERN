import { Link } from "react-router-dom";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "../../ui/sidebar";
import {
    ChartNoAxesCombined,
    ClapperboardIcon,
    LayoutDashboard,
    LogOutIcon,
    Subtitles,
    SubtitlesIcon,
    Video,
    VideoIcon,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { RiUserCommunityFill } from "react-icons/ri";
import { Separator } from "../../ui/separator";
import { UserSection } from "./user-section";
export const MainSection = () => {
    const { username } = useSelector((state: RootState) => state.auth.userData);
    const items = [
        {
            title: "Dashboard",
            url: ``,
            icon: LayoutDashboard,
        },
        ,
        {
            title: "Content",
            url: `videos`,
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
    const { state } = useSidebar();
    return (
        <SidebarGroup>
            <SidebarMenu>
                <UserSection />
                <Separator />
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            className={`${
                                state == "collapsed"
                                    ? "flex justify-center items-center mx-auto"
                                    : ""
                            }`}
                            size="lg"
                            tooltip={item.title}
                            asChild
                            isActive={false}
                            onClick={() => {}}
                        >
                            <Link
                                to={item.url}
                                className="w-full h-full flex items-center"
                            >
                                <div>
                                    <item.icon className="size-6" />
                                </div>
                                {state == "expanded" && (
                                    <span className="text-sm">
                                        {item.title}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                <Separator />
                <SidebarMenuItem>
                    <SidebarMenuButton
                        className={`${
                            state == "collapsed"
                                ? "flex justify-center items-center mx-auto"
                                : ""
                        }`}
                        size="lg"
                        tooltip={"Exit Studio"}
                        asChild
                        isActive={false}
                        onClick={() => {}}
                    >
                        <Link
                            to="/"
                            className="w-full h-full flex items-center"
                        >
                            <div>
                                <LogOutIcon className="size-6" />
                            </div>
                            {state == "expanded" && (
                                    <span className="text-sm">
                                        Exit Studio
                                    </span>
                                )}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};
