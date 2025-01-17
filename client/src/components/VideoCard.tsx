import { formatDuration } from "@/lib/utils.ts";

interface Props {
  thumbnail: string;
  duration: string;
  className?: string;
}

const VideoCard: React.FC<Props> = ({ thumbnail, duration, className = "" }) => {
  return (
    <div className="relative">
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className={`w-full aspect-video object-cover rounded-xl ${className}`}
        loading="lazy"
      />
      <p className="absolute right-[6px] bottom-2 bg-black bg-opacity-75 text-white text-[10px] font-bold px-2 py-[1px] rounded">
        {formatDuration(duration)}
      </p>
    </div>
  );
};

export default VideoCard;
