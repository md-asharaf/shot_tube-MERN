import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import videoService from "@/services/Video";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { toggleVideoModal } from "@/store/reducers/ui";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { VideoFormValidation } from "../ui/validation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { getVideoMetadata, sanitizeFileName } from "@/lib/utils";
import DragDropInput from "./DragAndDropInput";
import { IVideoUploadForm } from "@/interfaces";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { handleMultipartUpload } from "@/lib/s3";
import { resizeImageWithPica } from "@/lib/pica";
const VideoUpload = () => {
    const [controller, setController] = useState<AbortController | null>(null);
    const dispatch = useDispatch();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const form = useForm<IVideoUploadForm>({
        resolver: zodResolver(VideoFormValidation),
        defaultValues: {
            title: "",
            description: "",
            video: undefined,
            thumbnail: undefined,
        },
    });

    const uploadFile = async (file: File, key: string) => {
        const abortController = new AbortController();
        setController(abortController);
        const toastId = toast.loading(
            `Uploading ${
                file.type.includes("video") ? "video" : "thumbnail"
            } 0%`
        );
        try {
            const upload = await handleMultipartUpload(
                key,
                file,
                abortController
            );
            upload.on("httpUploadProgress", (progress) => {
                if (file.type.includes("video")) {
                    const percentage = Math.round(
                        (progress.loaded / (progress.total || 1)) * 100
                    );
                    toast.loading(
                        `Uploading ${
                            file.type.includes("video") ? "video" : "thumbnail"
                        } ${percentage}%`,
                        { id: toastId }
                    );
                }
            });
            await upload.done();
            toast.success(
                `${
                    file.type.includes("video") ? "Video" : "Thumbnail"
                } uploaded successfully`,
                { id: toastId }
            );
        } catch (error) {
            if (error.name === "AbortError") {
                toast.error(
                    `${
                        file.type.includes("video") ? "Video" : "Thumbnail"
                    } upload aborted`,
                    { id: toastId }
                );
            } else {
                toast.error(
                    `${
                        file.type.includes("video") ? "Video" : "Thumbnail"
                    } upload failed`,
                    { id: toastId }
                );
            }
            throw error;
        }
    };
    const handleAbort = () => {
        if (controller) {
            controller.abort();
        }
    };
    const handleSubmit = async (values: IVideoUploadForm) => {
        setIsUploading(true);
        const { title, description, video, thumbnail } = values;
        try {
            const resizedThumbnail = await resizeImageWithPica(thumbnail, 1280, 720);
            const { duration, height, width } = await getVideoMetadata(video);
            const videoSplits = video.name.split(".");
            const videoKey = `${Date.now()}_${sanitizeFileName(
                videoSplits[0]
            )}_${width}_${height}.${videoSplits[1]}`;
            const thumbnailKey = `uploads/user-uploads/${Date.now()}_${sanitizeFileName(
                resizedThumbnail.name
            )}`;

            await Promise.all([
                uploadFile(video, `uploads/user-uploads/${videoKey}`),
                uploadFile(resizedThumbnail, thumbnailKey),
            ]);

            await videoService.upload({
                title,
                description,
                video: `https://public-shot-tube-videos.s3.ap-south-1.amazonaws.com/${videoKey
                    .split(".")
                    .slice(0, -1)
                    .join(".")}/master.m3u8`,
                thumbnail: `https://shot-tube-videos.s3.ap-south-1.amazonaws.com/${thumbnailKey}`,
                duration,
                subtitle: `https://public-shot-tube-videos.s3.ap-south-1.amazonaws.com/${videoKey
                    .split(".")
                    .slice(0, -1)
                    .join(".")}/subtitle.vtt`,
            });
            setTimeout(
                () => toast.success("Video post created successfully"),
                2000
            );
        } catch (err) {
            setTimeout(() => toast.error("Failed to create video post"), 2000);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={() => dispatch(toggleVideoModal())}>
            <DialogContent className="max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Video</DialogTitle>
                    <DialogDescription>
                        Fill all the fields to upload a video.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="title">
                                        Title:
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter a title"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="description">
                                        Description:
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter a description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DragDropInput
                            label="Video:"
                            accept="video/*"
                            name="video"
                            form={form}
                        />
                        <DragDropInput
                            label="Thumbnail:"
                            accept="image/*"
                            name="thumbnail"
                            form={form}
                        />
                        <div className="flex items-center justify-between">
                            <Button
                                disabled={isUploading}
                                variant={"default"}
                                type="submit"
                                className="mr-4"
                            >
                                {isUploading ? `Uploading...` : "Publish"}
                            </Button>
                            <Button
                                type="button"
                                variant={"destructive"}
                                onClick={handleAbort}
                                disabled={!isUploading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default VideoUpload;
