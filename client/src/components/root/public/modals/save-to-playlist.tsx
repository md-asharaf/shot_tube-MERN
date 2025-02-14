import { IPlaylist } from "@/interfaces";
import {playlistService} from "@/services/Playlist";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { queryClient } from "@/main";
import { RootState } from "@/store/store";
import { userService } from "@/services/User";
import {
    setCreatePlaylistDialog,
    setSaveToPlaylistDialog,
} from "@/store/reducers/ui";
import {ResponsiveModal} from "./responsive-modal";

export const SaveToPlaylist = () => {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const { id, open } = useSelector(
        (state: RootState) => state.ui.saveToplaylistModalData
    );
    const { data: playlists } = useQuery({
        queryKey: ["playlists", userId],
        queryFn: async (): Promise<IPlaylist[]> => {
            const data = await playlistService.getAllPlaylists(userId);
            return data.playlists;
        },
        enabled: !!userId,
    });

    const { data: isSavedToWatchLater, refetch: refetchIsSavedToWatchLater } =
        useQuery({
            queryKey: ["is-video-saved", id, userId],
            queryFn: async () => {
                const data = await userService.isSavedToWatchLater(
                    id,
                    "video"
                );
                return data.isSaved;
            },
            enabled: !!id && !!userId,
        });

    const { data: isSavedToPlaylists, refetch: refetchIsSavedToPlaylists } =
        useQuery({
            queryKey: ["is-saved-statuses", id, playlists],
            queryFn: async (): Promise<boolean[]> => {
                const data = await playlistService.isSavedToPlaylists(
                    id,
                    "video"
                );
                return data.isSaved;
            },
            enabled: !!id && !!playlists,
        });

    const { mutate: saveToWatchLater } = useMutation({
        mutationFn: async () => {
            await userService.saveToWatchLater(id, "video");
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
            await userService.removeFromWatchLater(id, "video");
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
            await playlistService.addToPlaylist(playlistId, id, "video");
        },
        onSuccess: (_, { playlistId }) => {
            const playlist = playlists?.find((p) => p._id === playlistId);
            toast.success(`Added to ${playlist?.name}`);
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
            await playlistService.removeFromPlaylist(playlistId, id, "video");
        },
        onSuccess: (_, { playlistId }) => {
            const playlist = playlists?.find((p) => p._id === playlistId);
            toast.success(`Removed from ${playlist?.name}`);
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
    const closeDialog = () => {
        dispatch(setSaveToPlaylistDialog({ id: "", open:false }));
    };
    const handleOnNewPlaylistClick = () => {
        closeDialog();
        dispatch(setCreatePlaylistDialog(true));
    };
    return (
        <ResponsiveModal
            open={open}
            onOpenChange={closeDialog}
            title="Save video to..."
            width={60}
        >
            <div className="space-y-4">
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
                                checked={
                                    isSavedToPlaylists &&
                                    isSavedToPlaylists[index]
                                }
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
                <Button
                    size="sm"
                    className="w-full justify-center rounded-lg"
                    onClick={handleOnNewPlaylistClick}
                >
                    <Plus /> New Playlist
                </Button>
            </div>
        </ResponsiveModal>
    );
};

