import { EditIcon, VideoIcon, ChartNoAxesCombined } from "lucide-react";
import { MainSection } from "../main-section";
import { Option, SidebarGroupLayout } from "../sidebar/sidebar-group-layout";
interface PlaylistSectionProps {
    title: string;
    thumbnail: string;
    id: string;
}
export const PlaylistSection = ({
    title,
    thumbnail,
    id,
}: PlaylistSectionProps) => {
    const items: Option[] = [
        {
            title: "Details",
            url: "edit",
            icon: EditIcon,
        },
        {
            title: "Videos",
            url: "videos",
            icon: VideoIcon,
        },
        {
            title: "Analytics",
            url: "analytics",
            icon: ChartNoAxesCombined,
        },
    ];
    return (
        <SidebarGroupLayout options={items}>
            <MainSection
                desc="Your Playlist"
                title={title}
                thumbnail={thumbnail}
                id={id}
                type="playlist"
            />
        </SidebarGroupLayout>
    );
};
