import VideoCard from "@/components/root/VideoCard";
import { IVideoData } from "@/interfaces";
import { Link } from "react-router-dom";
import VideoTitle from "@/components/root/VideoTitle";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import videoServices from "@/services/video.services";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
    const lastVideoRef = useRef(null);
    const { data, isError, isLoading, hasNextPage, fetchNextPage } =
        useInfiniteQuery({
            queryKey: ["videos"],
            queryFn: async ({ pageParam }) => {
                const res = await videoServices.allVideos(8, pageParam);
                return res.data;
            },
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length == 8 ? allPages.length : undefined;
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
            threshold: 0.8,
        });

        if (lastVideoRef.current) {
            observer.observe(lastVideoRef.current);
        }

        return () => {
            if (lastVideoRef.current) {
                observer.unobserve(lastVideoRef.current);
            }
        };
    }, [observerCallback, lastVideoRef.current]);

    return (
        <>
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-y-6"
                onScroll={() => {
                    console.log("scrolling");
                }}
            >
                {data?.pages?.map((group, i) =>
                    group.map((video: IVideoData, index: number) => {
                        const isLast =
                            index === group.length - 1 &&
                            i === data.pages.length - 1;
                        return (
                            <Link
                                to={`/videos/${video._id}`}
                                key={video._id}
                                className="group flex flex-col gap-2 rounded-xl transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-200 hover:dark:bg-zinc-800"
                                ref={isLast ? lastVideoRef : null}
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
            {isLoading && (
                <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-10 w-10" />
                </div>
            )}
            {isError && (
                <div>
                    An error occured{" "}
                    <Button
                        variant="outline"
                        onClick={() => hasNextPage && fetchNextPage()}
                    >
                        <RefreshCw />
                    </Button>
                </div>
            )}
        </>
    );
};

export default Home;
