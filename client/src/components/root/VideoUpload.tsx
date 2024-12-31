import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import videoService from "@/services/video.services";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { toggleVideoModal } from "@/provider/ui.slice";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { getVideMetadata, sanitizeFileName } from "@/lib/utils";
import { S3Client } from "@aws-sdk/client-s3";
import { Progress, Upload } from "@aws-sdk/lib-storage";
import DragDropInput from "./DragAndDropInput";
import { IVideoUploadForm } from "@/interfaces";
import { toast } from "react-toastify";
const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME;

const VideoUpload = () => {
    const dispatch = useDispatch();
    const [uploadProgress, setUploadProgress] = useState<number>(0);
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
    const abortController = new AbortController();
    const uploadFile = async (file: File, key: string) => {
        try {
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: BUCKET,
                    Key: key,
                    Body: file,
                    ContentType: file.type,
                },
                abortController,
            });
            upload.on("httpUploadProgress", (progress: Progress) => {
                if (file.type.includes("video")) {
                    setUploadProgress(
                        Math.round((progress.loaded / progress.total) * 100)
                    );
                }
            });

            await upload.done();
        } catch (error) {
            if (error.name === "AbortError") {
                toast.info("Upload aborted");
            } else {
                toast.error("Upload failed");
            }
            throw error;
        }
    };

    const abortUpload = () => {
        abortController.abort();
    };

    const uploadVideo = async (values: IVideoUploadForm) => {
        setIsUploading(true);
        setUploadProgress(0);

        const { title, description, video, thumbnail } = values;
        try {
            const { duration, height,width } = await getVideMetadata(video);
            const videoSplits = video.name.split(".");
            const videoKey = `${Date.now()}_${sanitizeFileName(videoSplits[0])}_${width}_${height}.${videoSplits[1]}`;
            const thumbnailKey = `uploads/user-uploads/${Date.now()}_${sanitizeFileName(
                thumbnail.name
            )}`;
            await Promise.all([
                uploadFile(video, `uploads/user-uploads/${videoKey}`),
                uploadFile(thumbnail, thumbnailKey),
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

            dispatch(toggleVideoModal());
            toast.success("Video uploaded");
        } catch (err) {
            console.error("Upload failed, no video post created:", err);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50">
            <Card
                className={`shadow-xl shadow-transparent border-[1px] border-gray-500 dark:border-zinc-600 rounded-md sm:p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:bg-black z-40 sm:w-[500px] w-[90vw]`}
            >
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">
                        Upload Video
                    </CardTitle>
                    <CardDescription className="text-center">
                        Fill all the fields to upload a video.
                    </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(uploadVideo)}
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
                                    variant={"default"}
                                    type="submit"
                                    className="mr-4"
                                >
                                    {isUploading
                                        ? `${uploadProgress} %`
                                        : "Publish"}
                                </Button>
                                <Button
                                    type="button"
                                    variant={"destructive"}
                                    onClick={() => {
                                        dispatch(toggleVideoModal());
                                        abortUpload();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between"></CardFooter>
            </Card>
        </div>
    );
};

export default VideoUpload;
