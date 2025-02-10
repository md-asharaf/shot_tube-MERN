import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useDispatch } from "react-redux";
import { setOpenCard } from "@/store/reducers/short";
import Comments from "./Comments";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import commentService from "@/services/Comment";
import { Separator } from "./ui/separator";
import Filter from "@/components/Filter";
export default function ShortComments({
    shortId,
    playerRef,
    creatorId,
}: {
    shortId: string;
    playerRef: any;
    creatorId: string;
}) {
    const [filter, setFilter] = useState("All");
    const dispatch = useDispatch();
    const { data: totalComments, isLoading } = useQuery({
        queryKey: ["comments-count", shortId],
        queryFn: async () => {
            const data = await commentService.commentsCount(shortId, "short");
            return data.commentsCount;
        },
    });
    return (
        <Card className="flex flex-col w-[512px] h-[910px]">
                <CardTitle className="flex items-center justify-between p-2 text-xl">
                    <div className="flex gap-2 p-2">
                        {isLoading ? (
                            <>
                                <div className="bg-gray-300 dark:bg-zinc-700 animate-pulse h-6 rounded-md w-20"></div>
                                <div className="bg-gray-300 dark:bg-zinc-700 animate-pulse h-4 rounded-md w-10"></div>
                            </>
                        ) : (
                            <>
                                <div className="font-bold">Comments</div>
                                <div className="text-muted-foreground">
                                    {totalComments}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex space-x-4 items-center">
                        <Filter
                            key={shortId}
                            onFilterChange={setFilter}
                        />
                        <X
                            size={30}
                            strokeWidth={0.7}
                            onClick={() => dispatch(setOpenCard(""))}
                            className="cursor-pointer"
                        />
                    </div>
                </CardTitle>
            <Separator/>
            <CardContent className="flex-1 px-2 overflow-y-auto">
                <Comments
                    key={shortId}
                    playerRef={playerRef}
                    id={shortId}
                    creatorId={creatorId}
                    type="short"
                    filter={filter}
                />
            </CardContent>
        </Card>
    );
}
