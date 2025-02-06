import { useState } from "react";
import PlyrPlayer from "./VideoPlayer";
import { useMutation } from "@tanstack/react-query";
import shortService from "@/services/Short";
export default function ShortCard({ short, playerRef }) {
    const { mutate: increaseViews } = useMutation({
        mutationFn: async (shortId: string) => {
            await shortService.incrementViews(shortId);
        },
    });
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            className="group flex flex-col gap-2 p-2 rounded-lg relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {!isHovered ? (
                <img
                    src={short.thumbnail}
                    alt=""
                    className="w-full h-full aspect-[9/16] object-cover rounded-xl"
                />
            ) : (
                <PlyrPlayer
                    source={short.source}
                    subtitles={[
                        {
                            kind: "subtitles",
                            label: "English",
                            srclang: "en",
                            src: short.subtitle,
                        },
                    ]}
                    onViewTracked={() => increaseViews(short._id)}
                    className="w-full h-full aspect-[9/16]"
                    playerRef={playerRef}
                    controls={[]}
                />
            )}
            <div className="space-y-1">
                <p className="font-bold line-clamp-2">{short.title}</p>
                <div className="text-sm">{`${short.views} views`}</div>
            </div>
        </div>
    );
}
