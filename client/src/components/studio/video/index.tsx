import { Outlet, useParams } from "react-router-dom";
import { SidebarLayout } from "../sidebar/layout";
import { VideoSection } from "./section";
import { IVideoData } from "@/interfaces";
import { videoService } from "@/services/Video";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
export const StudioVideo = () => {
    const { id } = useParams();
    const { data: video, isLoading } = useQuery({
        queryKey: ["video", id],
        queryFn: async (): Promise<IVideoData> => {
            const data = await videoService.singleVideo(id);
            return data.video;
        },
        enabled: !!id,
    });
    if (isLoading) return null;
    return (
        <div className="flex min-h-screen pt-[4rem]">
            <SidebarLayout>
                <VideoSection
                    title={video.title}
                    thumbnail={video.thumbnail}
                    id={video._id}
                />
            </SidebarLayout>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
