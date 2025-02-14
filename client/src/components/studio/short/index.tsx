import { Outlet } from "react-router-dom";
import { SidebarLayout } from "../sidebar/layout";
import { ShortSection } from "./section";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { shortService } from "@/services/Short";
import { IShortData } from "@/interfaces";
import { Loader2 } from "lucide-react";
export const StudioShort = () => {
    const { id } = useParams();
    const { data: short, isLoading } = useQuery({
        queryKey: ["short", id],
        queryFn: async (): Promise<IShortData> => {
            const data = await shortService.singleShort(id);
            return data.short;
        },
        enabled: !!id,
    });
    if (isLoading) return null;
    return (
        <div className="flex min-h-screen pt-[4rem]">
            <SidebarLayout>
                <ShortSection
                    title={short.title}
                    thumbnail={short.thumbnail}
                    id={short._id}
                />
            </SidebarLayout>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
