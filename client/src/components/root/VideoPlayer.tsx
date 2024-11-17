import React, { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import "plyr/dist/plyr.css";

const PlyrPlayer = ({ hlsUrl, subtitles = [], className = "" }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const hlsRef = useRef(null);
    const [currentQuality, setCurrentQuality] = useState("auto");
    const [qualities, setQualities] = useState([]);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

    useEffect(() => {
        const setupHls = () => {
            if (!Hls.isSupported()) {
                console.warn("HLS is not supported");
                return;
            }

            hlsRef.current = new Hls({
                maxLoadingDelay: 4,
                defaultAudioCodec: "mp4a.40.2",
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                autoStartLoad: true,
                startLevel: -1,
            });

            hlsRef.current.attachMedia(videoRef.current);

            hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
                console.log("HLS Media Attached");
                hlsRef.current.loadSource(hlsUrl);
            });

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                console.log("Available levels:", data.levels);
                const qualityMap = {
                    "50000":"360",
                    "100000":"480",
                    "250000":"720",
                    "500000":"1080",
                }
                // Get available qualities
                const availableQualities = data.levels.map((level, index) => ({
                    id: index,
                    height: level.height || "Unknown",
                    bitrate: level.bitrate,
                    name: level.height
                        ? `${level.height}p`
                        : `${qualityMap[level.bitrate]}p`,
                }));
                setQualities(availableQualities);

                // Initialize player
                initPlyr(availableQualities);
            });

            hlsRef.current.on(Hls.Events.LEVEL_SWITCHING, (_, data) => {
                const newQuality =
                    data.level === -1
                        ? "auto"
                        : qualities[data.level]?.name || "auto";
                setCurrentQuality(newQuality);
            });
        };

        const initPlyr = (availableQualities) => {
            // Define quality options including auto
            const qualityOptions = {
                default: "auto", // -1 represents 'auto'
                options: ["auto", ...availableQualities.map((q) => q.name)],
                forced: true,
                onChange: (quality) => {
                    if (!hlsRef.current) return;

                    console.log("Quality change requested:", quality);
                    hlsRef.current.currentLevel = parseInt(quality);

                    const newQuality =
                        quality === -1
                            ? "auto"
                            : qualities[quality]?.name || "auto";
                    setCurrentQuality(newQuality);
                },
            };

            // Initialize Plyr with quality options
            playerRef.current = new Plyr(videoRef.current, {
                controls: [
                    "play-large",
                    "play",
                    "progress",
                    "current-time",
                    "duration",
                    "mute",
                    "volume",
                    "captions",
                    "settings",
                    "pip",
                    "fullscreen",
                ],
                settings: ["quality", "speed", "captions"],
                quality: qualityOptions,
            });

            // Add custom quality labels
            playerRef.current.on("ready", () => {
                const instance = playerRef.current;
                instance.quality = -1; // Start with auto

                // Update quality labels in the settings menu
                const labels = {
                    "-1": "Auto",
                    ...Object.fromEntries(
                        availableQualities.map((q) => [q.id.toString(), q.name])
                    ),
                };

                if (instance.elements.settings) {
                    const qualityMenu =
                        instance.elements.settings.panels.quality;
                    if (qualityMenu) {
                        const buttons =
                            qualityMenu.getElementsByClassName("plyr__control");
                        Array.from(buttons).forEach((button) => {
                            const value = (button as HTMLElement).getAttribute(
                                "data-plyr-quality"
                            );
                            if (value && labels[value]) {
                                const label = (
                                    button as HTMLElement
                                ).getElementsByClassName(
                                    "plyr__menu__value"
                                )[0];
                                if (label) {
                                    label.textContent = labels[value];
                                }
                            }
                        });
                    }
                }
            });
        };

        setupHls();

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [hlsUrl]);

    // Toggle subtitle visibility
    const toggleSubtitles = () => {
        setSubtitlesEnabled(!subtitlesEnabled);
        if (playerRef.current) {
            playerRef.current.captions.toggle();
        }
    };

    // Manual quality selection through buttons
    const setQuality = (quality) => {
        if (!hlsRef.current) return;

        if (quality === "auto") {
            hlsRef.current.currentLevel = -1;
            setCurrentQuality("auto");
            if (playerRef.current) {
                playerRef.current.quality = -1;
            }
        } else {
            const levelIndex = qualities.findIndex((q) => q.name === quality);
            if (levelIndex !== -1) {
                hlsRef.current.currentLevel = levelIndex;
                setCurrentQuality(quality);
                if (playerRef.current) {
                    playerRef.current.quality = levelIndex;
                }
            }
        }
    };

    return (
        <Card className={`${className}`}>
            <div className="aspect-w-16 aspect-h-9">
                <video
                    ref={videoRef}
                    className="plyr-react plyr w-full"
                    crossOrigin="anonymous"
                >
                    {subtitles.map((subtitle, index) => (
                        <track
                            key={index}
                            kind={subtitle.kind}
                            label={subtitle.label}
                            srcLang={subtitle.srclang}
                            src={subtitle.src}
                            default={index === 0 && subtitlesEnabled}
                        />
                    ))}
                </video>
            </div>
        </Card>
    );
};

export default PlyrPlayer;
