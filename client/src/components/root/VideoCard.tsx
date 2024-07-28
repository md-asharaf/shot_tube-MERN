import { IVideoData } from "@/interfaces";
interface Props {
    video: IVideoData;
    className?: string;
}
const VideoCard: React.FC<Props> = ({ video, className = "" }) => {
    return (
        <div className="relative">
            <img
                src={video.thumbnail.url}
                alt="Video thumbnail"
                className={`w-full h-full aspect-video object-cover rounded-xl ${className}`}
                loading="lazy"
            />
            <p className="absolute right-[6px] bottom-2 bg-black text-white text-[10px] font-bold px-2 py-[1px] rounded">
                {video.duration}
            </p>
        </div>
    );
};
export default VideoCard;
