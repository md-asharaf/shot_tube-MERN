import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import VideoCard from "@/components/root/VideoCard";
import VideoTitle from "@/components/root/VideoTitle";
import videoServices from "@/services/video.services";
import LoadingSkeleton from "@/components/skeletons/LoadingSkeleton";
import { IVideoData } from "@/interfaces";

const Home = () => {
    const loaderRef = useRef(null);
    const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ["videos"],
        queryFn: async ({ pageParam }) => {
            const res = await videoServices.allVideos(12, pageParam);
            return res.data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length == 12 ? allPages.length : undefined;
        },
    });

    const observerCallback = useCallback(
        (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: "0px",
            threshold: 0.2,
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [observerCallback, loaderRef.current]);

    return (
        <>
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-y-6 dark:text-white text-black">
                        {data?.pages?.map((group) =>
                            group.map((video: IVideoData, index: number) => {
                                return (
                                    <Link
                                        to={`/videos/${video._id}`}
                                        key={video._id}
                                        className="group flex flex-col gap-2 rounded-xl transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-200 hover:dark:bg-zinc-800"
                                    >
                                        <VideoCard
                                            video={video}
                                            className="group-hover:rounded-none"
                                        />
                                        <VideoTitle video={video} isImage />
                                    </Link>
                                );
                            })
                        )}
                    </div>
                    <div
                        className="flex items-center justify-center h-10"
                        ref={loaderRef}
                    >
                        {hasNextPage && (
                            <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Home;
