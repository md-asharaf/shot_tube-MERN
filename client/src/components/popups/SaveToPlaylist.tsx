import { IPlaylist } from "@/interfaces";
import playlistServices from "@/services/Playlist";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { queryClient } from "@/main";
import { RootState } from "@/store/store";
import userServices from "@/services/User";

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
    const [playlistName, setPlaylistName] = useState<string>("");
    const [dialogState, setDialogState] = useState({
        mainDialog: false,
        newPlaylistDialog: false,
    });

    const closeDialogs = () =>
        setDialogState({ mainDialog: false, newPlaylistDialog: false });

    const {
        data: playlists,
        refetch: refetchPlaylists,
    } = useQuery({
        queryKey: ["playlists", userId],
        queryFn: async (): Promise<IPlaylist[]> => {
            const data = await playlistServices.getAllPlaylists(userId);
            return data.playlists;
        },
        enabled: !!userId,
    });

    const {
        data: isSavedToWatchLater,
        refetch: refetchIsSavedToWatchLater,
    } = useQuery({
        queryKey: ["is-video-saved", videoId,userId],
        queryFn: async () => {
            const data = await userServices.isSavedToWatchLater(videoId);
            return data.isSaved;
        },
        enabled: !!videoId && !!userId,
    });

    const {
        data: isSavedToPlaylists,
        refetch: refetchIsSavedToPlaylists,
    } = useQuery({
        queryKey: ["is-saved-statuses", videoId, playlists],
        queryFn: async (): Promise<boolean[]> => {
            return await Promise.all(
                playlists?.map(async (p) => {
                    const data = await playlistServices.isSavedToPlaylist(
                        videoId,
                        p._id
                    );
                    return data.isSaved;
                })
            );
        },
        enabled: !!videoId && !!playlists,
    });

    const { mutate: saveToWatchLater } = useMutation({
        mutationFn: async () => {
            await userServices.saveToWatchLater(videoId);
        },
        onSuccess: () => {
            toast.success("Saved to watch later");
            refetchIsSavedToWatchLater();
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
            refetchIsSavedToWatchLater();
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
            refetchIsSavedToPlaylists();
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
            refetchIsSavedToPlaylists();
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
            refetchPlaylists();
            setPlaylistName("");
            setDialogState((prev) => ({
                ...prev,
                newPlaylistDialog: false,
            }));
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create playlist");
        },
    });

    return (
        <>
            <Dialog
                open={dialogState.mainDialog}
                onOpenChange={(isOpen) =>
                    setDialogState((prev) => ({ ...prev, mainDialog: isOpen }))
                }
            >
                <DialogTrigger className={className}>{children}</DialogTrigger>
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
                                    checked={isSavedToPlaylists&&isSavedToPlaylists[index]}
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
                            onClick={() =>
                                setDialogState((prev) => ({
                                    ...prev,
                                    newPlaylistDialog: true,
                                    mainDialog: false,
                                }))
                            }
                        >
                            <Plus className="mr-2" /> New Playlist
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={dialogState.newPlaylistDialog}
                onOpenChange={(isOpen) =>
                    setDialogState((prev) => ({
                        ...prev,
                        newPlaylistDialog: isOpen,
                    }))
                }
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
