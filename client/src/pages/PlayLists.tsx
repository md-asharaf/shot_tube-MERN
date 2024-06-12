import { IPlaylist } from "@/interfaces";
import { RootState } from "@/provider";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSuccess } from "@/lib/utils";
import PlaylistCard from "@/components/root/PlaylistCard";
import PlaylistTitle from "@/components/root/PlaylistTitle";
import { Link } from "react-router-dom";
import playlistServices from "@/services/playlist.services";

const PlayLists = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth);
    const [playlists, setPLaylists] = useState<IPlaylist[]>([]);
    const isSuccess = useSuccess(dispatch);
    const fetchAndSetPlaylists = async () => {
        const res = await playlistServices.getPlaylists(user.userData._id);
        if (isSuccess(res)) {
            setPLaylists(res.data);
        }
    };
    useEffect(() => {
        if (!user) return;
        fetchAndSetPlaylists();
    }, [user]);

    return (
        <Link to="/playlists/videos">
            <div className="px-2">
                <h1 className="text-4xl font-bold">Playlists</h1>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {playlists.map((playlist, index) => (
                        <div
                            key={index}
                            className="space-y-2 rounded-xl p-2 hover:bg-gray-400"
                        >
                            <PlaylistCard {...playlist} />
                            <PlaylistTitle {...playlist} />
                        </div>
                    ))}
                </div>
            </div>
        </Link>
    );
};

export default PlayLists;
