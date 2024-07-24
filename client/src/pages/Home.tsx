import VideoCard from "@/components/root/VideoCard";
import { IVideoData } from "@/interfaces";
import { Link } from "react-router-dom";
import VideoTitle from "@/components/root/VideoTitle";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideo } from "@/provider/video.slice";
const Home = () => {
    const { setVideos, videos } = useVideo();
    const fetchVideos = async () => {
        const res = await videoServices.allVideos();
        console.log(res.data);
        setVideos(res.data);
        return res.data;
    };
    const { isError, error, isLoading } = useQuery<IVideoData[]>({
        queryKey: ["all-videos"],
        queryFn: fetchVideos,
    });
    if (isLoading)
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                {[1, 2, 3, 4].map((key) => (
                    <Skeleton
                        key={key}
                        className="flex flex-col space-y-3 col-span-1 p-2"
                    >
                        <Skeleton className="h-2/3 rounded-xl" />
                        <div className="h-1/3 flex flex-col space-y-4">
                            <Skeleton className="h-8" />
                            <Skeleton className="h-8" />
                        </div>
                    </Skeleton>
                ))}
            </div>
        );
    if (isError) return <div>Error: {error.message}</div>;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-y-4">
            {videos?.map((video, index) => (
                <Link
                    to={`/videos/${video._id}`}
                    key={index}
                    className="group flex flex-col gap-2 bg-white rounded-xl transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-400"
                >
                    <VideoCard
                        video={video}
                        className="group-hover:rounded-none"
                    />
                    <VideoTitle video={video} isImage />
                </Link>
            ))}
        </div>
    );
};

export default Home;
