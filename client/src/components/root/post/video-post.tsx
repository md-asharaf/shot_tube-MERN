import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlyrPlayer } from "../video-player";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { videoService } from "@/services/video";
import { IVideoData } from "@/interfaces";
import { Link } from "react-router-dom";
import { Divide, Loader2 } from "lucide-react";
interface Data {
  text: string;
  video: string;
}
interface VideoPostProps {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
}

export const VideoPost = ({ data, setData }: VideoPostProps) => {
  const { text, video } = data;
  const [videoId, setVideoId] = useState("");
  const handleTextChange = (e) => {
    setData((prev) => ({ ...prev, text: e.target.value }));
  };
  const handleVideoLinkChange = (e) => {
    setData((prev) => ({ ...prev, video: e.target.value }));
  };
  useEffect(() => {
    if (video) {
      const id = video.split("/").pop();
      if (id.length === 24) setVideoId(id);
    }
  }, [video]);
  const { data: videoData, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: async (): Promise<IVideoData> => {
      const data = await videoService.singleVideo(videoId);
      return data.video;
    },
    enabled: !!videoId,
  });
  return (
    <div className="flex flex-col space-y-2">
      <Textarea
        value={text}
        placeholder="What's on your mind?"
        onChange={handleTextChange}
        className="resize-none"
      />
      <Label className="ml-3">Video link:</Label>
      <Input
        defaultValue={text}
        type="text"
        maxLength={100}
        onChange={handleVideoLinkChange}
        placeholder="Enter option"
      />
      {isLoading && (
        <div className="flex items-center justify-center w-full mx-auto">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      )}
      {videoData && (
        <div className="flex flex-col space-y-2 items-center justify-center">
          <div className="max-w-md">
            <img src={videoData.thumbnail} loading="lazy" />
          </div>
          <Link
            to={video}
            className="hover:underline text-blue-500 ml-2 cursor-pointer"
          >
            {video}
          </Link>
        </div>
      )}
    </div>
  );
};
