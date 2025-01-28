import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function shortName(name: string | undefined) {
    if (!name) return "";
    const splitName = name.split(" ");
    if (splitName.length == 2) {
        return (splitName[0][0] + splitName[1][0]).toUpperCase();
    }
    return splitName[0][0].toUpperCase();
}
export function getVideoMetadata(
    file: File
): Promise<{ height: number; width: number; duration: number }> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = function () {
            window.URL.revokeObjectURL(video.src);
            resolve({
                height: video.videoHeight,
                duration: video.duration,
                width: video.videoWidth,
            });
        };
        video.onerror = function () {
            reject("Error loading video metadata");
        };
        video.src = URL.createObjectURL(file);
    });
}
export function formatDuration(duration: string) {
    const durationNumber = parseInt(duration, 10);
    const hours = Math.floor(durationNumber / 3600);
    const minutes = Math.floor((durationNumber % 3600) / 60);
    const seconds = durationNumber % 60;
    if (hours > 0) {
        return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
            seconds < 10 ? "0" : ""
        }${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9.]/g, "_");
}

export function formatViews(count: number) {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
}
export function generateColor(fullname:string) {
    const colors = [
        "bg-red-500/30",
        "bg-blue-500/30",
        "bg-green-500/30",
        "bg-yellow-500/30",
        "bg-purple-500/30",
        "bg-pink-500/30",
        "bg-orange-500/30",
    ];
    let hash = 0;
    for (let i = 0; i < fullname.length; i++) {
        hash = fullname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}