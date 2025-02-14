import {
    Pagination,
    PaginationNext,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { studioService } from "@/services/Studio";
interface Video {
    _id: string;
    title: string;
    description: string;
    source: string;
    thumbnail: string;
    visibility: string;
    createdAt: Date;
    likes: number;
    views: number;
    comments: number;
}
export const ContentVideos = () => {
    const { username } = useParams();
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const { data: videosPages } = useInfiniteQuery({
        queryKey: ["videos", username, page],
        queryFn: async (): Promise<{docs:Video[],totalPages:number,hasNextPage:boolean}> => {
            const data = await studioService.getUserVideos(username, page);
            return data.videos;
        },
        initialPageParam: page,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? page + 1 : undefined;
        },
    });
    const videos = videosPages?.pages.flatMap((p) => p.docs) || [];
    const totalPages = videosPages?.pages[0]?.totalPages || 0;  

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Video</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Likes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos.map((video, index) => (
                        <TableRow key={index} onClick={() => navigate(`/studio/video/${video._id}`)}>
                            <TableCell>
                                <div className="flex items-start gap-4 max-w-96">
                                    <img
                                        src={video.thumbnail}
                                        alt="video"
                                        className="aspect-video w-32 rounded-lg"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold line-clamp-1 text-sm">
                                            {video.title}
                                        </p>
                                        <p className="line-clamp-2 text-xs">
                                            {video.description}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{video.visibility}</TableCell>
                            <TableCell>
                                {new Date(video.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </TableCell>
                            <TableCell>{video.views}</TableCell>
                            <TableCell>{video.comments}</TableCell>
                            <TableCell>{video.likes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage(Math.max(1, page - 1))}
                            hidden={page === 1}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        Page {page} of {totalPages}
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                setPage(Math.min(totalPages, page + 1))
                            }
                            hidden={page === totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
