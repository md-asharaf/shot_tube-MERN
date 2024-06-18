import { useEffect, useState } from "react";
import VideoCard from "@/components/root/VideoCard";
import { useDispatch } from "react-redux";
import { IVideoData } from "@/interfaces";
import { Link } from "react-router-dom";
import VideoTitle from "@/components/root/VideoTitle";
import videoServices from "@/services/video.services";
import { useSuccess } from "@/lib/utils";
const Home = () => {
    const dispatch = useDispatch();
    const [videos, setVideos] = useState<IVideoData[]>([]);
    const successfull = useSuccess(dispatch);
    const fetchAndSetVideos = async () => {
        const res = await videoServices.getAll();
        if (successfull(res)) {
            setVideos(res.data);
        }
    };
    useEffect(() => {
        fetchAndSetVideos();
    }, []);
    return (
        <div className="px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-rows-2">
            {videos?.map((video, index) => (
                <Link
                    to={`/videos/${video._id}`}
                    key={index}
                    className="group bg-white rounded-xl overflow-hidden transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-400"
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
