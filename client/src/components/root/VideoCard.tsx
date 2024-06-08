import { IVideoData } from "@/interfaces";
interface Props {
    video: IVideoData;
    className?: string;
}
const VideoCard: React.FC<Props> = ({ video, className = "" }) => {
    return (
        <div className="relative h-2/3">
            <img
                src={video.thumbnail.url}
                alt="Video thumbnail"
                className={`h-full w-full rounded-xl ${className}`}
            />
            <p className="absolute right-[6px] bottom-2 bg-black text-white text-[10px] font-bold px-2 py-[1px] rounded">
                {video.duration}
            </p>
        </div>
    );
};
export default VideoCard;
