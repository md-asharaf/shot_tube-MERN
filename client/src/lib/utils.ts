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
export function getVideMetadata(
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
    const durationNumber = parseInt(duration);
    const minutes = Math.floor(durationNumber / 60);
    const seconds = durationNumber % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9.]/g, "_");
}
