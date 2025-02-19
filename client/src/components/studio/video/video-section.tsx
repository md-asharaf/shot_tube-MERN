
import { EditIcon, ChartNoAxesCombined, MessageSquareMore, SubtitlesIcon } from "lucide-react";
import { MainSection } from "../main-section";
import { Option, SidebarGroupLayout } from "../sidebar/sidebar-group-layout";
interface VideoSectionProps {
    title: string;
    thumbnail: string;
    id: string;
    route:string;
}
export const VideoSection = ({ title, thumbnail, id,route}: VideoSectionProps) => {
    const items:Option[]=[
        {
            title:"Details",
            url:"edit",
            icon:EditIcon
        },
        {
            title:"Analytics",
            url:"analytics",
            icon: ChartNoAxesCombined
        },
        {
            title:"Comments",
            url:"comments",
            icon:MessageSquareMore
        },
        {
            title:"Subtitles",
            url:"subtitles",
            icon:SubtitlesIcon
        }
    ]
    return (
        <SidebarGroupLayout options={items}>
            <MainSection desc='Your Video' title={title} thumbnail={thumbnail} id={id} type="video" route={route}/>
        </SidebarGroupLayout>
    )
};