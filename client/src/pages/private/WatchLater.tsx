import { Button } from "@/components/ui/button";
import { IVideoData } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import PlaylistComp from "@/components/PlaylistComp";
import userServices from "@/services/User";
import { RootState } from "@/store/store";

const WatchLater = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);
    const {
        data: videos,
        isError,
        error,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["watch-later", userData?._id],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await userServices.getWatchLater();
            return data.watchLater;
        },
        enabled: !!userData?._id,
    });

    if (isLoading || isFetching) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isError) {
        const errorMessage = error?.message || "Something went wrong.";
        return (
            <div className="flex items-center justify-center h-full text-xl text-red-500">
                <p>ERROR: {errorMessage}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="ml-4 bg-red-500 text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-2xl">
                No liked videos...
            </div>
        );
    }

    return (
        <PlaylistComp
            playlist={{
                name: "Watch Later",
                creator: userData?.fullname,
                updatedAt: new Date(),
                totalViews: videos?.reduce(
                    (prev, curr) => prev + (curr?.views || 0),
                    0
                ),
                videos,
                description: "videos you saved to watch later",
            }}
        />
    );
};

export default WatchLater;

