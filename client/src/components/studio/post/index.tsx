import { Outlet } from "react-router-dom";
import { SidebarLayout } from "../sidebar/layout";
import { PostSection } from "./section";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/Post";
import { IPostData } from "@/interfaces";
export const StudioPost = () => {
    const { id } = useParams();
    const { data: post, isLoading } = useQuery({
        queryKey: ["post", id],
        queryFn: async (): Promise<IPostData> => {
            const data = await postService.getPostById(id);
            return data.post;
        },
        enabled: !!id,
    });
    if (isLoading) return null;
    return (
        <div className="flex min-h-screen pt-[4rem]">
            <SidebarLayout>
                <PostSection
                    title={post.content}
                    thumbnail={post.image}
                    id={post._id}
                />
            </SidebarLayout>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
