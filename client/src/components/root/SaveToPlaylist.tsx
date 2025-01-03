import { IPlaylist } from "@/interfaces";
import playlistServices from "@/services/Playlist";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { queryClient } from "@/main";
import { DialogTrigger } from "@radix-ui/react-dialog";
import userServices from "@/services/User";
import { RootState } from "@/store/store";

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
    const [isMainDialogOpen, setIsMainDialogOpen] = useState<boolean>(false);
    const [isNewPlaylistDialogOpen, setIsNewPlaylistDialogOpen] =
        useState<boolean>(false);

    const closeDialogs = () => {
        setIsMainDialogOpen(false);
        setIsNewPlaylistDialogOpen(false);
    };
    const {
        data: playlists,
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

    const { data: isSavedToWatchLater, refetch: refetch2 } = useQuery({
        queryKey: ["is-video-saved", videoId],
        queryFn: async () => {
            const data = await userServices.isSavedToWatchLater(videoId);
            return data.isSaved;
        },
        enabled: !!videoId && !!userId,
    });
    
    const fetch = async () => {
        const result = await Promise.all(
            playlists?.map(async (p) => {
                const data = await playlistServices.isSavedToPlaylist(
                    videoId,
                    p._id
                );
                return data.isSaved;
            })
        );
        setIsSavedToPlaylists(result);
    };
    const { mutate: saveToWatchLater } = useMutation({
        mutationFn: async () => {
            await userServices.saveToWatchLater(videoId);
        },
        onSuccess: () => {
            toast.success("Saved to watch later");
            refetch2();
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["watch-later", userId],
                exact: true,
            });
        },
    });
    const { mutate: removeFromWatchLater } = useMutation({
        mutationFn: async () => {
            await userServices.removeFromWatchLater(videoId);
        },
        onSuccess: () => {
            toast.success("Removed from watch later");
            refetch2();
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["watch-later", userId],
                exact: true,
            });
        },
    });

    const { mutate: add } = useMutation({
        mutationFn: async ({ playlistId }: { playlistId: string }) => {
            await playlistServices.addVideoToPlaylist(videoId, playlistId);
        },
        onSuccess: () => {
            toast.success(`Added to playlist`);
            fetch();
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["playlist", variables.playlistId],
                exact: true,
            });
            queryClient.invalidateQueries({
                queryKey: ["playlists", userId],
                exact: true,
            });
        },
    });

    const { mutate: remove } = useMutation({
        mutationFn: async ({ playlistId }: { playlistId: string }) => {
            await playlistServices.removeVideoFromPlaylist(videoId, playlistId);
        },
        onSuccess: () => {
            toast.success(`Removed from playlist`);
            fetch();
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["playlist", variables.playlistId],
                exact: true,
            });
            queryClient.invalidateQueries({
                queryKey: ["playlists", userId],
                exact: true,
            });
        },
    });

    const { mutate: createPlaylist } = useMutation({
        mutationFn: async () => {
            await playlistServices.createPlaylist(playlistName);
        },
        onSuccess: () => {
            toast.success(`${playlistName} created`);
            refetch();
            setPlaylistName("");
        },
    });

    useEffect(() => {
        fetch();
    }, [playlists, videoId]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
                <DialogTrigger
                    onClick={() => setIsMainDialogOpen(true)}
                    className={`${className}`}
                >
                    {children}
                </DialogTrigger>
                <DialogContent className="w-60 bg-white dark:bg-[#212121] rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Save video to...</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {userId && (
                            <div className="flex items-center justify-between">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={isSavedToWatchLater}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            saveToWatchLater();
                                        } else {
                                            removeFromWatchLater();
                                        }
                                    }}
                                />
                                <span>Watch Later</span>
                            </div>
                        )}
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
                                            add({ playlistId: playlist._id });
                                        } else {
                                            remove({
                                                playlistId: playlist._id,
                                            });
                                        }
                                    }}
                                />
                                <span>{playlist.name}</span>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full justify-center"
                            onClick={() => {
                                setIsMainDialogOpen(false);
                                setIsNewPlaylistDialogOpen(true);
                            }}
                        >
                            <Plus className="mr-2" /> New Playlist
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isNewPlaylistDialogOpen}
                onOpenChange={setIsNewPlaylistDialogOpen}
            >
                <DialogContent className="w-80 bg-white dark:bg-[#212121] rounded-lg">
                    <DialogHeader>
                        <DialogTitle>New Playlist</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={playlistName}
                        placeholder="Enter playlist name"
                        onChange={(e) => setPlaylistName(e.target.value)}
                    />
                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={closeDialogs}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createPlaylist()}
                            disabled={!playlistName.trim()}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SaveToPlaylist;
