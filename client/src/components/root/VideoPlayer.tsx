import { memo, useEffect } from "react";
import { videoPlayer } from "cloudinary-video-player";
import "cloudinary-video-player/cld-video-player.min.css";

const HLSVideoPlayer = ({ src, className = "" }) => {
    useEffect(() => {
        const player = videoPlayer("player", {
            cloudName: "demo",
        });
        player.source(src);
    });
    return (
        <video
            id="player"
            controls
            autoPlay
            className={`cld-video-player cld-fluid ${className}`}
        />
    );
};

export default memo(HLSVideoPlayer);
