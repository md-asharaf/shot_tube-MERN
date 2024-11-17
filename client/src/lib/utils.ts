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
export function getVideoDuration(file: File) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = function () {
            window.URL.revokeObjectURL(video.src); // Clean up
            resolve(video.duration);
        };

        video.onerror = function () {
            reject("Error loading video metadata");
        };

        video.src = URL.createObjectURL(file); // Set video source
    });
}
export function formatDuration(duration: string) {
    //convert string to number
    const durationNumber = parseInt(duration);
    const minutes = Math.floor(durationNumber / 60);
    const seconds = durationNumber % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
