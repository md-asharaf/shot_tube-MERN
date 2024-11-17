import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import videoService from "@/services/video.services";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { toggleVideoModal } from "@/provider/ui.slice";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { VideoFormValidation } from "../ui/validation";
import { IVideoForm } from "@/interfaces";
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
import { useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { getVideoDuration } from "@/lib/utils";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
});
const BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

const VideoUpload = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const abortControllerRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const form = useForm<IVideoForm>({
        resolver: zodResolver(VideoFormValidation),
        defaultValues: {
            title: "",
            description: "",
            video: undefined,
            thumbnail: undefined,
        },
    });
    const videoRef = form.register("video");
    const thumbnailRef = form.register("thumbnail");
    const sanitizeFileName = (fileName:string) => {
        // Replace all special characters (except for alphanumeric and period) with underscores
        return fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    };
    const uploadFile = async (file: File) => {
        try {
            // Generate a unique key for the file
            const key = `uploads/user-uploads/${sanitizeFileName(file.name)}`;
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: BUCKET,
                    Key: key,
                    Body: file,
                    ContentType: file.type,
                },
                abortController: abortControllerRef.current,
            });
    
            // Track upload progress
            upload.on("httpUploadProgress", (progress) => {
                if (file.type.includes("video")) {
                    setUploadProgress(
                        Math.round((progress.loaded / progress.total) * 100)
                    );
                }
            });
    
            // Await completion of upload
            const response = await upload.done();
            console.log("Uploaded file", response);
        } catch (error) {
            // Handle abort or other upload errors
            if (error.name === "AbortError") {
                console.log("Upload aborted by the user");
                toast({
                    title: "Upload aborted",
                    description: "The upload was canceled",
                });
            } else {
                console.error("Error uploading file", error);
                toast({
                    title: "Error",
                    description: "Failed to upload file",
                });
            }
    
            // Throw the error so it can be caught in the calling function
            throw error;
        }
    };
    
    const abortUpload = async () => {
        if (abortControllerRef.current) {
            console.log("Aborting upload");
            abortControllerRef.current.abort();
        }
    };
    
    const uploadVideo = async (values: IVideoForm) => {
        setIsUploading(true);
        setUploadProgress(0);
        
        const { title, description, video, thumbnail} = values;
        const videoFile = video[0];
        const thumbnailFile = thumbnail[0];
    
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
    
        try {
            
            // Upload both video and thumbnail files
            await Promise.all([uploadFile(videoFile), uploadFile(thumbnailFile)]);
            
            // Reset abort controller after successful upload
            abortControllerRef.current = null;
            
            // Get video duration
            const duration = await getVideoDuration(video[0]);
            // encode file names to avoid special characters
            const sanitizedVideoFileName = sanitizeFileName(videoFile.name);
            const sanitizedThumbnailFileName = sanitizeFileName(thumbnailFile.name);
            // Create video post only if both uploads are successful
            await videoService.upload({
                title,
                description,
                video: `https://public-shot-tube-videos.s3.ap-south-1.amazonaws.com/${sanitizedVideoFileName.split(".").slice(0, -1).join(".")}/master.m3u8`,
                thumbnail: `https://shot-tube-videos.s3.ap-south-1.amazonaws.com/uploads/user-uploads/${sanitizedThumbnailFileName}`,
                duration,
                subtitle: `https://public-shot-tube-videos.s3.ap-south-1.amazonaws.com/${sanitizedVideoFileName.split(".").slice(0, -1).join(".")}/subtitle.vtt`
            });
    
            // Close video modal and notify success
            dispatch(toggleVideoModal());
            toast({
                title: "Video uploaded successfully",
                description: "Your video is now live",
            });
    
        } catch (err) {
            console.error("Upload failed, no video post created:", err);
            toast({
                title: "Error",
                description: "Failed to upload video or thumbnail. No video post created.",
            });
        } finally {
            setIsUploading(false);
        }
    };
        
    return (
        <div className="w-screen h-screen fixed top-0 right-0 bg-[#0000009e] dark:bg-[#5756569e] z-30">
            <Card
                className={`shadow-xl shadow-transparent border-[1px] border-gray-500 dark:border-zinc-600 rounded-md p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:bg-black z-40 sm:w-[500px] w-[90vw]`}
            >
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">
                        Upload Video
                    </CardTitle>
                    <CardDescription className="text-center">
                        Fill all the fields to upload a video.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(uploadVideo)}
                            className="space-y-8 mt-4"
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
                            <FormField
                                control={form.control}
                                name="video"
                                render={() => (
                                    <FormItem>
                                        <FormLabel htmlFor="video">
                                            Video:
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="video/*"
                                                {...videoRef}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="thumbnail"
                                render={() => (
                                    <FormItem>
                                        <FormLabel htmlFor="thumbnail">
                                            Thumbnail:
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                {...thumbnailRef}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
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
