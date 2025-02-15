import { commentService } from "@/services/comment";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { TextArea } from "@/components/root/text-area";
import { Filter } from "@/components/root/public/filter";
import { Comments } from "@/components/root/public/comments";
import { queryClient } from "@/main";
export const VideoComments = ({ videoId, playerRef, creatorId }) => {
    const [filter, setFilter] = useState("All");
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { data: totalComments, isLoading } = useQuery({
        queryKey: ["comments-count", videoId],
        queryFn: async () => {
            const data = await commentService.commentsCount(videoId, "video");
            return data.commentsCount;
        },
    });
    const { mutate: addComment, isPending } = useMutation({
        mutationFn: async ({
            id,
            content,
        }: {
            id: string;
            content: string;
        }) => {
            const data = await commentService.comment(id, content, "video");
            return data.comment;
        },
        onSuccess: () => {
            toast.success("Comment added");
            queryClient.invalidateQueries({
                queryKey: ["comments", videoId, filter],
            });
        },
    });
    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }
    return (
        <div className="px-2 space-y-2">
            <div className="flex sm:space-x-16 items-center justify-between sm:justify-normal">
                <div className="font-bold text-2xl text-zinc-600 dark:text-zinc-300 mb-2">
                    {`${totalComments} Comments`}
                </div>
                <Filter onFilterChange={setFilter} />
            </div>
            <div className="flex flex-col">
                {userData && isPending ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <TextArea
                        fullname={userData?.fullname}
                        userAvatar={userData?.avatar}
                        placeholder="Add a public comment..."
                        onSubmit={(content) =>
                            addComment({ id: videoId, content })
                        }
                        submitLabel="Comment"
                    />
                )}

                <Comments
                    id={videoId}
                    creatorId={creatorId}
                    playerRef={playerRef}
                    filter={filter}
                    type="video"
                />
            </div>
        </div>
    );
};
