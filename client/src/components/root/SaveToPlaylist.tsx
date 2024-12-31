import { IPlaylist } from "@/interfaces";
import playlistServices from "@/services/playlist.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import { queryClient } from "@/main";

interface Props {
    videoId: string;
    children: React.ReactNode;
    className?: string;
}

const SaveToPlaylist: React.FC<Props> = ({
    videoId,
    children,
    className = "",
}) => {
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const [isSavedToPlaylists, setIsSavedToPlaylists] = useState<
        Array<boolean>
    >([]);
    const [playlistName, setPlaylistName] = useState<string>("");
    const [isMainPopoverOpen, setIsMainPopoverOpen] = useState<boolean>(false);
    const [isNewPlaylistPopoverOpen, setIsNewPlaylistPopoverOpen] =
        useState<boolean>(false);

    const closePopovers = () => {
        setIsMainPopoverOpen(false);
        setIsNewPlaylistPopoverOpen(false);
    };

    const { mutate: add } = useMutation({
        mutationFn: async ({ playlistId }: { playlistId: string }) => {
            await playlistServices.addVideoToPlaylist(videoId, playlistId);
            queryClient.invalidateQueries({
                queryKey: ["playlist", playlistId],
                exact: true,
            });
        },
        onSuccess: () => {
            toast.success(`Added to ${playlistName}`);
            queryClient.invalidateQueries({
                queryKey: ["playlists", userId],
                exact: true,
            });
            fetch();
            return true;
        },
    });
    const { mutate: remove } = useMutation({
        mutationFn: async ({ playlistId }: { playlistId: string }) => {
            await playlistServices.removeVideoFromPlaylist(videoId, playlistId);
            queryClient.invalidateQueries({
                queryKey: ["playlist", playlistId],
                exact: true,
            });
        },
        onSuccess: () => {
            toast.success(`Removed from ${playlistName}`);
            queryClient.invalidateQueries({
                queryKey: ["playlists", userId],
                exact: true,
            });
            fetch();
            return true;
        },
    });
    const {
        data: playlists,
        isError,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["playlists", userId],
        queryFn: async (): Promise<IPlaylist[]> => {
            const data = await playlistServices.getAllPlaylists(userId);
            return data.playlists;
        },
        enabled: !!userId,
    });
    const fetch = async () => {
        try {
            const result = await Promise.all(
                playlists?.map(async (p) => {
                    try {
                        const data = await playlistServices.isSavedToPlaylist(
                            videoId,
                            p._id
                        );
                        return data.isSaved;
                    } catch (error) {
                        throw error;
                    }
                })
            );
            setIsSavedToPlaylists(result);
        } catch (error) {
            return [];
        }
    };
    useEffect(() => {
        fetch();
    }, [playlists, videoId]);
    const { mutate: createPlaylist } = useMutation({
        mutationFn: async () => {
            await playlistServices.createPlaylist(playlistName);
        },
        onSuccess: () => {
            toast.success("Playlist created");
            refetch();
            setPlaylistName("");
            return true;
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;
    return (
        <>
            {(isMainPopoverOpen || isNewPlaylistPopoverOpen) && (
                <div
                    className="fixed inset-0 bg-black/60 z-40"
                    onClick={closePopovers}
                />
            )}

            {isMainPopoverOpen && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 z-50">
                    <Card className="w-60 relative">
                        <CardHeader>
                            <CardTitle>
                                <div className="flex justify-between items-center">
                                    <div className="text-xl">
                                        Save video to...
                                    </div>
                                    <X
                                        size={30}
                                        onClick={closePopovers}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {playlists?.map((playlist, index) => (
                                    <div
                                        key={playlist._id}
                                        className="flex items-center justify-between"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5"
                                            checked={isSavedToPlaylists[index]}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    add({
                                                        playlistId:
                                                            playlist._id,
                                                    });
                                                } else {
                                                    remove({
                                                        playlistId:
                                                            playlist._id,
                                                    });
                                                }
                                            }}
                                        />
                                        <span>{playlist.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button
                                variant="outline"
                                className="px-10 rounded-full flex items-center space-x-2"
                                onClick={() => {
                                    setIsMainPopoverOpen(false);
                                    setIsNewPlaylistPopoverOpen(true);
                                }}
                            >
                                <Plus className="text-2xl" />
                                <span>New Playlist</span>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {isNewPlaylistPopoverOpen && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 z-50">
                    <Card className="w-60">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                New Playlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                value={playlistName}
                                placeholder="Enter playlist name"
                                onChange={(e) =>
                                    setPlaylistName(e.target.value)
                                }
                            />
                        </CardContent>
                        <CardFooter className="space-x-4">
                            <Button variant="outline" onClick={closePopovers}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => createPlaylist()}
                                disabled={!playlistName.trim()}
                            >
                                Create
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
            <button
                onClick={() => setIsMainPopoverOpen(true)}
                className={`${className}`}
            >
                {children}
            </button>
        </>
    );
};

export default SaveToPlaylist;
