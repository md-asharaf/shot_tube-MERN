import { IVideoData } from "@/interfaces";
interface Props {
    video: IVideoData;
    className?: string;
}
const VideoCard: React.FC<Props> = ({ video, className = "" }) => {
    //format video duration
    const formatDuration = (duration: string) => {
        //convert string to number
        const durationNumber = parseInt(duration);
        const minutes = Math.floor(durationNumber / 60);
        const seconds = durationNumber % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
    return (
        <div className="relative">
            <img
                src={video.thumbnail}
                alt="Video thumbnail"
                className={`w-full h-full aspect-video object-cover rounded-xl ${className}`}
                loading="lazy"
            />
            <p className="absolute right-[6px] bottom-2 bg-black text-white text-[10px] font-bold px-2 py-[1px] rounded">
                {formatDuration(video.duration)}
            </p>
        </div>
    );
};
export default VideoCard;
