import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import VideoTitle from "@/components/VideoTitle";
import videoServices from "@/services/Video";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { IVideoData } from "@/interfaces";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
const Home = () => {
    const loaderRef = useRef(null);
    const { data, hasNextPage, fetchNextPage,isLoading } = useInfiniteQuery({
        queryKey: ["videos"],
        queryFn: async ({ pageParam }): Promise<IVideoData[]> => {
            NProgress.start();
            const data = await videoServices.allVideos(12, pageParam);
            NProgress.done();
            return data.videos;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 12 ? allPages.length : undefined;
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-y-2 w-full">
                        {data?.pages?.map((group) =>
                            group.map((video) => (
                                <Link
                                    to={`/video?v=${video._id}`}
                                    key={video._id}
                                    className="group flex flex-col gap-2 rounded-lg p-2 hover:bg-muted"
                                >
                                    <VideoCard
                                        thumbnail={video.thumbnail}
                                        duration={video.duration}
                                        className="group-hover:rounded-none"
                                    />
                                    <VideoTitle
                                        video={{
                                            _id: video._id,
                                            views: video.views,
                                            createdAt: video.createdAt,
                                            title: video.title,
                                        }}
                                        creator={{
                                            username: video.creator.username,
                                            fullname: video.creator.fullname,
                                            avatar: video.creator.avatar,
                                        }}
                                    />
                                </Link>
                            ))
                        )}
                    </div>

                    <div
                        className="flex items-center justify-center h-10"
                        ref={loaderRef}
                    >
                        {hasNextPage && (
                            <Loader2 className="animate-spin h-10 w-10" />
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Home;
