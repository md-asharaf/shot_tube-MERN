import { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";

const PlyrPlayer = ({
    source,
    subtitles = [],
    className = "",
    thumbnailPreviews = "",
    playerRef,
    onViewTracked = () => {},
    minWatchTime = 15,
    controls
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [watchTime, setWatchTime] = useState(0);
    const [hasWatched, setHasWatched] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(0);

    const bitrateToResolution = {
        "500000": 360,
        "1000000": 480,
        "2500000": 720,
        "5000000": 1080,
    };

    useEffect(() => {
        const initializePlayer = () => {
            const video = videoRef.current;
            if (!video) return;

            const defaultOptions: Plyr.Options = {
                hideControls: true,
                controls,
                settings: ["quality", "captions", "speed"],
                previewThumbnails: {
                    enabled: !!thumbnailPreviews,
                    src: thumbnailPreviews,
                },
                tooltips: { controls: true, seek: true },
            };

            if (!Hls.isSupported()) {
                video.src = source;
                playerRef.current = new Plyr(video, defaultOptions);
            } else {
                const hls = new Hls();
                hlsRef.current = hls;
                hls.loadSource(source);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    const availableQualities = hls.levels.map(
                        (l) => bitrateToResolution[l.bitrate]
                    );
                    availableQualities.unshift(0);

                    defaultOptions.quality = {
                        default: 1,
                        options: availableQualities,
                        forced: true,
                        onChange: (newQuality: number) => {
                            if (newQuality === 0) {
                                hls.currentLevel = -1;
                            } else {
                                hls.levels.forEach((level, index) => {
                                    if (
                                        bitrateToResolution[level.bitrate] ===
                                        newQuality
                                    ) {
                                        hls.currentLevel = index;
                                    }
                                });
                            }
                        },
                    };

                    defaultOptions.i18n = {
                        qualityLabel: { 0: "Auto" },
                    };

                    playerRef.current = new Plyr(video, defaultOptions);

                    playerRef.current.on("ready", () => {
                        if (playerRef.current) {
                            playerRef.current.muted=true;
                            playerRef.current.captions.active = false;
                        }
                    });
                });

                hls.attachMedia(video);
            }
        };

        initializePlayer();

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
            if (playerRef && playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [source]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (video.paused || video.ended) return;
            const currentTime = video.currentTime;
            setWatchTime((prev) => prev + (currentTime - lastUpdateTime));
            setLastUpdateTime(currentTime);
        };

        const events = ["play", "pause", "seeking", "seeked", "timeupdate"];
        events.forEach((event) =>
            video.addEventListener(event, handleTimeUpdate)
        );

        if (watchTime >= minWatchTime && !hasWatched) {
            setHasWatched(true);
            onViewTracked();
        }

        return () => {
            events.forEach((event) =>
                video.removeEventListener(event, handleTimeUpdate)
            );
        };
    }, [watchTime, hasWatched, lastUpdateTime]);

    return (
        <div className="rounded-md object-cover overflow-hidden">
            <video
                ref={videoRef}
                className={`plyr-react plyr ${className}`}
                crossOrigin="anonymous"
                preload="none"
                autoPlay
            >
                {subtitles.map((subtitle, index) => (
                    <track
                        key={index}
                        kind={subtitle.kind}
                        label={subtitle.label}
                        srcLang={subtitle.srclang}
                        src={subtitle.src}
                        default={index === 0}
                    />
                ))}
            </video>
        </div>
    );
};

export default PlyrPlayer;
