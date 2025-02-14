
import { EditIcon, MessageSquareMore} from "lucide-react";
import { MainSection } from "../main-section";
import { Option, SidebarGroupLayout } from "../sidebar/sidebar-group-layout";
interface PostSectionProps {
    title: string;
    thumbnail: string;
    id: string;
}
export const PostSection = ({ title, thumbnail, id }: PostSectionProps) => {
    const items:Option[]=[
        {
            title:"Details",
            url:"edit",
            icon:EditIcon
        },
        {
            title:"Delete",
            url:"comments",
            icon: MessageSquareMore
        }
    ]
    return (
        <SidebarGroupLayout options={items}>
            <MainSection desc='Your Post' title={title} thumbnail={thumbnail} id={id} type="post" />
        </SidebarGroupLayout>
    )
};