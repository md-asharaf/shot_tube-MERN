import { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import "plyr/dist/plyr.css";

const PlyrPlayer = ({ source, subtitles = [], className = "",playerRef}) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const bitrateToResolution = {
        "500000": 360,
        "1000000": 480,
        "2500000": 720,
        "5000000": 1080,
    };
    useEffect(() => {
        const initializePlayer = () => {
            const video = videoRef.current;
            const defaultOptions: Plyr.Options = {
                hideControls:true,
                controls: [
                    "play",
                    "restart",
                    "progress",
                    "current-time",
                    "mute",
                    "captions",
                    "settings",
                    "fullscreen",
                    "pip"
                ],
                settings: ["quality","speed"],
            };

            if (!Hls.isSupported()) {
                video.src = source;
                playerRef.current = new Plyr(video, defaultOptions);
            } else {
                const hls = new Hls();
                hls.loadSource(source);

                hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    const availableQualities = hls.levels.map(
                        (l) => bitrateToResolution[l.bitrate]
                    );
                    availableQualities.unshift(0); 

                    defaultOptions.quality = {
                        default: 0, 
                        options: availableQualities,
                        forced: true,
                        onChange: (newQuality) => updateQuality(newQuality),
                    };

                    defaultOptions.i18n = {
                        qualityLabel: {
                            0: "Auto",
                        },
                    };

                    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                        const qualityLabelElement = document.querySelector(
                            ".plyr__menu__container [data-plyr='quality'][value='0'] span"
                        );
                        if (hls.autoLevelEnabled) {
                            qualityLabelElement.innerHTML = `Auto (${
                                bitrateToResolution[
                                    hls.levels[data.level].bitrate
                                ]
                            }p)`;
                        } else {
                            qualityLabelElement.innerHTML = "Auto";
                        }
                    });

                    playerRef.current = new Plyr(video, defaultOptions);

                    playerRef.current.on("ready", () => {
                        playerRef.current.captions.active = true;
                        playerRef.current.captions.language = "en";
                    });
                });

                hls.attachMedia(video);
                hlsRef.current = hls;
            }
        };

        const updateQuality = (newQuality) => {
            if (newQuality === 0) {
                hlsRef.current.currentLevel = -1;
            } else {
                hlsRef.current.levels.forEach((level, levelIndex) => {
                    if (bitrateToResolution[level.bitrate] === newQuality) {
                        hlsRef.current.currentLevel = levelIndex;
                    }
                });
            }
        };

        initializePlayer();

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [source]);
    return (
        <Card className={`${className}`}>
                <video
                    ref={videoRef}
                    className="plyr-react plyr w-full aspect-video"
                    crossOrigin="anonymous"
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
        </Card>
    );
};

export default PlyrPlayer;
