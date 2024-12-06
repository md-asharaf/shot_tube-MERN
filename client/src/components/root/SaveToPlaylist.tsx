import { IPlaylist } from "@/interfaces";
import playlistServices from "@/services/playlist.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListPlus, Plus, X } from "lucide-react";

interface Props {
    userId: string;
    videoId: string;
}

const SaveToPlaylist: React.FC<Props> = ({ userId, videoId }) => {
    const [playlistName, setPlaylistName] = useState<string>("");
    const [isMainPopoverOpen, setIsMainPopoverOpen] = useState<boolean>(false);
    const [isNewPlaylistPopoverOpen, setIsNewPlaylistPopoverOpen] =
        useState<boolean>(false);

    const closePopovers = () => {
        setIsMainPopoverOpen(false);
        setIsNewPlaylistPopoverOpen(false);
    };

    const getPlaylists = async () => {
        const res = await playlistServices.getPlaylists(userId);
        return res.data;
    };

    const createPlaylistMutation = async () => {
        await playlistServices.create(playlistName);
        closePopovers();
        refetch();
    };

    const addVideoToPlaylist = async (playlistId: string) => {
        const res = await playlistServices.addVideoToPlaylist(
            videoId,
            playlistId
        );
        return res.data;
    };
    const removeVideoFromPlaylist = async (playlistId: string) => {
        const res = await playlistServices.removeVideoFromPlaylist(
            videoId,
            playlistId
        );
        return res.data;
    };
    const { mutate: add } = useMutation({
        mutationFn: addVideoToPlaylist,
    });
    const { mutate: remove } = useMutation({
        mutationFn: removeVideoFromPlaylist,
    });
    const {
        data: playlists,
        isError,
        error,
        isLoading,
        refetch,
    } = useQuery<IPlaylist[]>({
        queryKey: ["playlists", userId],
        queryFn: getPlaylists,
    });

    const { mutate: createPlaylist } = useMutation({
        mutationFn: createPlaylistMutation,
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <>
            {(isMainPopoverOpen || isNewPlaylistPopoverOpen) && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={closePopovers}
                />
            )}

            {isMainPopoverOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
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
                                {playlists?.map((playlist) => (
                                    <div
                                        key={playlist._id}
                                        className="flex items-center justify-between"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    add(playlist._id);
                                                } else {
                                                    remove(playlist._id);
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
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
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
                                onClick={() => {
                                    createPlaylist();
                                    refetch();
                                }}
                                disabled={!playlistName.trim()}
                            >
                                Create
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
            <Button
                disabled={!userId}
                variant="outline"
                className="dark:bg-zinc-600 border-none bg-zinc-200 h-7 sm:h-9"
                onClick={() => {
                    setIsMainPopoverOpen(true);
                    setIsNewPlaylistPopoverOpen(false);
                }}
            >
                <ListPlus />
            </Button>
        </>
    );
};

export default SaveToPlaylist;
