import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { videoService } from "@/services/Video";
import { shortService } from "@/services/Short";
import { useDispatch, useSelector } from "react-redux";
import { toggleVideoModal } from "@/store/reducers/ui";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { getVideoMetadata } from "@/lib/utils";
import { IVideoUploadForm } from "@/interfaces";
import { toast } from "sonner";
import { resizeImage } from "@/lib/pica";
import { RootState } from "@/store/store";
import { VideoFormValidation } from "@/validations";
import { DragDropInput } from "@/components/root/private/drag-n-drop-input";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";
import { uploadService } from "@/services/Upload";
import { uploadAllParts, uploadToPresignedUrl } from "@/lib/upload";
import { ResponsiveModal } from "./responsive-modal";
interface IMetaData {
    uploadId: string;
    videoKey: string;
}
const BUCKET01 = process.env.AWS_S3_BUCKET;
const BUCKET02 = process.env.AWS_S3_BUCKET_NAME;
export const VideoUpload = () => {
    const [abortController, setAbortController] =
        useState<AbortController | null>(null);
    const open = useSelector((state: RootState) => state.ui.isVideoModalOpen);
    const dispatch = useDispatch();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadMetaData, setUploadMetaData] = useState<IMetaData | null>(
        null
    );
    const form = useForm<IVideoUploadForm>({
        resolver: zodResolver(VideoFormValidation),
        defaultValues: {
            title: "",
            description: "",
            video: undefined,
            thumbnail: undefined,
        },
    });

    const handleSubmit = async (values: IVideoUploadForm) => {
        setIsUploading(true);
        try {
            const { title, description, video, thumbnail } = values;
            const { duration, height, width } = await getVideoMetadata(video);
            const isShort = duration <= 90 && height > width;
            const resizedThumbnail = await resizeImage(
                thumbnail,
                isShort ? 720 : 1280,
                isShort ? 1280 : 720
            );
            const videoExtension = video.name.split(".")[1];
            const thumbnailExtension = resizedThumbnail.name.split(".")[1];
            const videoKey = `uploads/${
                isShort ? "shorts" : "videos"
            }/${uuid()}_${width}_${height}.${videoExtension}`;
            const thumbnailKey = `uploads/thumbnails/${uuid()}.${thumbnailExtension}`;
            const contentType = video.type || "application/octet-stream";
            const videoUploadTask = async () => {
                const toastId = toast.loading("Uploading video : 0%", {
                    action: {
                        label: "Abort",
                        onClick: handleAbort,
                        actionButtonStyle: {
                            backgroundColor: "red",
                            padding: "0.5rem 1rem",
                        },
                    },
                });
                try {
                    const { uploadId, presignedUrls } =
                        await uploadService.initiateMultipartUpload(
                            videoKey,
                            contentType,
                            100
                        );
                    setUploadMetaData({ uploadId, videoKey });

                    const partETags = await uploadAllParts(
                        presignedUrls,
                        video,
                        (progress) => {
                            toast.loading(`Uploading video : ${progress}%`, {
                                id: toastId,
                                action: {
                                    label: "Abort",
                                    onClick: handleAbort,
                                    actionButtonStyle: {
                                        backgroundColor: "red",
                                        padding: "0.5rem 1rem",
                                    },
                                },
                            });
                        }
                    );

                    await uploadService.completeMultiPartUpload(
                        uploadId,
                        videoKey,
                        partETags
                    );
                    toast.success("Video uploaded successfully!", {
                        id: toastId,
                    });
                } catch (error) {
                    toast.error(error.message, { id: toastId });
                    throw error;
                } finally {
                    setUploadMetaData(null);
                }
            };

            if (video.size >= 500 * 1024 * 1024) await videoUploadTask();
            else {
                const toastId = toast.loading("Uploading video : 0%", {
                    action: {
                        label: "Abort",
                        onClick: handleAbort,
                        actionButtonStyle: {
                            backgroundColor: "red",
                            padding: "0.5rem 1rem",
                        },
                    },
                });
                try {
                    const { url } =
                        await uploadService.getPutObjectPresignedUrl(
                            videoKey,
                            contentType
                        );
                    const controller = new AbortController();
                    setAbortController(controller);
                    await uploadToPresignedUrl(
                        url,
                        video,
                        controller,
                        (progress) => {
                            toast.loading(`Uploading video : ${progress}%`, {
                                id: toastId,
                                action: {
                                    label: "Abort",
                                    onClick: handleAbort,
                                    actionButtonStyle: {
                                        backgroundColor: "red",
                                        padding: "0.5rem 1rem",
                                    },
                                },
                            });
                        }
                    );
                    toast.success("Video uploaded successfully!", {
                        id: toastId,
                    });
                } catch (error) {
                    toast.error(error.message, { id: toastId });
                    throw error;
                } finally {
                    setAbortController(null);
                }
            }
            const { url } = await uploadService.getPutObjectPresignedUrl(
                thumbnailKey,
                resizedThumbnail.type
            );
            await uploadToPresignedUrl(url, resizedThumbnail);
            if (isShort) {
                await shortService.upload({
                    title,
                    description,
                    source: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                        .split(".")[0]}/${height}p.m3u8`,
                    thumbnail: `https://${BUCKET02}.s3.ap-south-1.amazonaws.com/${thumbnailKey}`,
                    subtitle: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                        .split(".")[0]}/subtitle.vtt`,
                    thumbnailPreviews: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                        .split(".")[0]}/thumbnails/thumbnails.vtt`,
                });
            } else {
                await videoService.upload({
                    title,
                    description,
                    source: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                        .split(".")[0]}/master.m3u8`,
                    thumbnail: `https://${BUCKET02}.s3.ap-south-1.amazonaws.com/${thumbnailKey}`,
                    duration,
                    subtitle: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                        .split(".")[0]}/subtitle.vtt`,
                    thumbnailPreviews: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                        .split(".")[0]}/thumbnails/thumbnails.vtt`,
                });
            }

            setTimeout(() => toast.success("Video post created!"), 1000);
        } catch (err) {
            console.log(err);
            setTimeout(() => toast.error("Failed to create video post"), 1000);
        } finally {
            setIsUploading(false);
            dispatch(toggleVideoModal());
        }
    };
    const handleAbort = async () => {
        try {
            if (abortController) {
                return abortController.abort();
            }
            await uploadService.abortMultiPartUpload(
                uploadMetaData.uploadId,
                uploadMetaData.videoKey
            );
            toast.warning("Upload aborted!!");
        } catch (error) {
            toast.error("Failed to abort upload");
        }
    };
    const closeDialog = () => {
        dispatch(toggleVideoModal());
    };
    return (
        <ResponsiveModal
            open={open}
            onOpenChange={closeDialog}
            title="Upload Video"
        >
            <div className="space-y-2 max-w-[500px] max-h-[calc(100vh-4rem)] rounded-lg">
                <div>Fill all the fields to upload a video.</div>
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
                                            className="h-40"
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
            </div>
        </ResponsiveModal>
    );
};

export default VideoUpload;
