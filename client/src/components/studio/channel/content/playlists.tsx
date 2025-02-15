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
import { studioService } from "@/services/studio";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
interface Playlist {
    _id: string;
    name: string;
    description: string;
    visibility: string;
    updatedAt: string;
    videoCount: number;
    thumbnail: string;
}
export const ContentPlaylists = () => {
    const { username } = useParams();
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { data: playlistsPages } = useInfiniteQuery({
        queryKey: ["playlists", username, page],
        queryFn: async ({
            pageParam,
        }): Promise<{
            docs: Playlist[];
            totalPages: number;
            hasNextPage: boolean;
        }> => {
            const data = await studioService.getUserPlaylists(
                username,
                pageParam
            );
            return data.playlists;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => {
            return lastPage.hasNextPage ? pages.length + 1 : undefined;
        },
    });
    const playlists = playlistsPages?.pages.flatMap((p) => p.docs) || [];
    const totalPages = playlistsPages?.pages[0]?.totalPages || 0;
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Playlist</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Video Count</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {playlists.map((playlist, index) => (
                        <TableRow key={index} onClick={() => navigate(`/studio/playlist/${playlist._id}`)}>
                            <TableCell>
                                <div className="flex items-start gap-4 max-w-96">
                                        <img
                                        src={playlist.thumbnail}
                                        alt="playlist"
                                        className="aspect-video w-32 rounded-lg"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold line-clamp-1 text-sm">
                                            {playlist.name}
                                        </p>
                                        <p className="line-clamp-2 text-xs">
                                            {playlist.description}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{playlist.visibility}</TableCell>
                            <TableCell>
                                {new Date(
                                    playlist.updatedAt
                                ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </TableCell>
                            <TableCell>{playlist.videoCount}</TableCell>
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
