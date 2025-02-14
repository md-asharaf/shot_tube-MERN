import { AvatarImg } from "@/components/root/avatar-image";
import {
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "../ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

interface UserSectionProps {
    title: string;
    desc: string;
    thumbnail: string;
    id: string;
    type: string;
}
export const MainSection = ({ title, desc, thumbnail, id, type }: UserSectionProps) => {
    const { state } = useSidebar();
    const navigate = useNavigate();
    const link = `/${type}/${id}`;
    if (state == "collapsed") {
        return (
            <SidebarMenuItem className="w-full">
                <SidebarMenuButton
                    size="lg"
                    className="mx-auto"
                >
                    <Link to={link}>
                        <img
                            src={thumbnail}
                            alt=""
                            className="w-9 hover:opacity-80 transition-opacity rounded aspect-video"
                        />
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }
    return (
        <SidebarHeader className="flex items-center pb-4">
            <SidebarMenuItem className="w-full" onClick={() => navigate(-1)} >
                <SidebarMenuButton size="lg">
                    <div className="flex items-center gap-4">
                        <ArrowLeftIcon className="size-6" />
                        <p className="text-lg font-semibold">Channel Content</p>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <Link to={link}>
                <img
                    src={thumbnail}
                    alt=""
                    className="w-full hover:opacity-80 transition-opacity rounded aspect-video"
                />
            </Link>
            <div className="flex flex-col items-start mt-2 w-full">
                <p className="font-bold">{desc}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{title}</p>
            </div>
        </SidebarHeader>
    );
};
