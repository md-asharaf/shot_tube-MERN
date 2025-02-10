import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import videoService from "@/services/Video";
import shortService from "@/services/Short";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { IVideoData } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setRandomShortId, setShorts } from "@/store/reducers/short";
import { SiYoutubeshorts } from "react-icons/si";
import { useIntersection } from "@mantine/hooks";
import ShortCard from "@/components/ShortCard";
const Home = () => {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const shorts = useSelector((state: RootState) => state.short.shorts);
    const playerRef = useRef(null);
    const lastVideoRef = useRef<HTMLElement>(null);

    const {
        data: videoPages,
        hasNextPage,
        fetchNextPage,
        isLoading,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["recommended-videos", userId, null],
        queryFn: async ({ pageParam }): Promise<IVideoData[]> => {
            const data = await videoService.recommendedVideos(
                pageParam,
                null,
                userId
            );
            return data.recommendations;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 12 ? allPages.length + 1 : null;
        },
    });
    const videos = videoPages?.pages?.flatMap((page) => page);
    useQuery({
        queryKey: ["recommended-shorts", userId, null],
        queryFn: async () => {
            const data = await shortService.recommendedShorts(1, null, userId);
            dispatch(setShorts(data.recommendations));
            dispatch(setRandomShortId());
            return true;
        },
    });
    const { ref, entry } = useIntersection({
        root: lastVideoRef.current,
        threshold: 1,
    });
    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage();
        }
    }, [entry]);
    if (isLoading) {
        return <LoadingSkeleton />;
    }
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-y-2 w-full ">
                {videos.map((video, i) => (
                    <Link
                        to={`/video?v=${video._id}`}
                        key={video._id}
                        ref={i == videos.length ? ref : null}
                    >
                        <VideoCard
                            playerRef={playerRef}
                            video={video}
                            isAvatar
                            putExtraOptions
                        />
                    </Link>
                ))}
            </div>
            <div className="flex items-center space-x-2 my-2">
                <SiYoutubeshorts className="text-2xl" />
                <div className="font-bold text-2xl">Shorts</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-y-2 w-full">
                {shorts.map((short) => (
                    <Link to={`/short?s=${short._id}`} key={short._id}>
                        <ShortCard short={short} playerRef={playerRef} />
                    </Link>
                ))}
            </div>
            <div className="flex items-center justify-center">
                {isFetchingNextPage && (
                    <Loader2 className="animate-spin h-10 w-10" />
                )}
            </div>
        </div>
    );
};

export default Home;
