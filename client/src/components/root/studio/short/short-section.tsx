
import { EditIcon, ChartNoAxesCombined, MessageSquareMore, SubtitlesIcon } from "lucide-react";
import { MainSection } from "../main-section";
import { Option, SidebarGroupLayout } from "../sidebar/sidebar-group-layout";
interface ShortSectionProps {
    title: string;
    thumbnail: string;
    id: string;
    route: string;
}
export const ShortSection = ({ title, thumbnail, id,route }: ShortSectionProps) => {
    const items:Option[]=[
        {
            title:"Details",
            url:"edit",
            icon:EditIcon
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
            <MainSection desc='Your Short' title={title} thumbnail={thumbnail} id={id} type="short" route={route} />
        </SidebarGroupLayout>
    )
};