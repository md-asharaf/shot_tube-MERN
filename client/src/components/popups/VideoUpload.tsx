import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import videoService from "@/services/Video";
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
import { getVideoMetadata, sanitizeFileName } from "@/lib/utils";
import { IVideoUploadForm } from "@/interfaces";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { resizeImageWithPica } from "@/lib/pica";
import { RootState } from "@/store/store";
import { VideoFormValidation } from "../../validations";
import DragDropInput from "../DragAndDropInput";
import { Button } from "../ui/button";
import { v4 as uuid } from "uuid";
import uploadService from "@/services/Upload";
import { uploadAllParts, uploadToPresignedUrl } from "@/lib/upload";
interface IMetaData {
    uploadId: string;
    videoKey: string;
}
const BUCKET01=process.env.AWS_S3_BUCKET;
const BUCKET02=process.env.AWS_S3_BUCKET_NAME;
const VideoUpload = () => {
    const isVideoModalOpen = useSelector(
        (state: RootState) => state.ui.isVideoModalOpen
    );
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
            const resizedThumbnail = await resizeImageWithPica(
                thumbnail,
                1280,
                720
            );
            const { duration, height, width } = await getVideoMetadata(video);
            const videoSplits = video.name.split(".");
            const videoKey = `${uuid()}_${sanitizeFileName(
                videoSplits[0]
            )}_${width}_${height}.${videoSplits[1]}`;
            const thumbnailKey = `uploads/user-uploads/${uuid()}_${sanitizeFileName(
                resizedThumbnail.name
            )}`;
            const contentType = video.type || "application/octet-stream";
            const videoUploadTask = async () => {
                const toastId = toast.loading("Uploading video : 0%");
                try {
                    const { uploadId, presignedUrls } = await uploadService.initiateMultipartUpload(
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
                            });
                        }
                    );
    
                    await uploadService.completeMultiPartUpload(uploadId, videoKey, partETags);
                    setUploadMetaData(null);
                    toast.success("Video uploaded successfully!", { id: toastId });
                } catch (error) {
                    toast.error(error.message, { id: toastId });
                    throw error;
                }
            };
    
            await videoUploadTask();
            const { url } = await uploadService.getPutObjectPresignedUrl(
                thumbnailKey,
                resizedThumbnail.type
            );
            await uploadToPresignedUrl(url, resizedThumbnail);
            await videoService.upload({
                title,
                description,
                video: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                    .split(".")
                    .slice(0, -1)
                    .join(".")}/master.m3u8`,
                thumbnail: `https://${BUCKET02}.s3.ap-south-1.amazonaws.com/${thumbnailKey}`,
                duration,
                subtitle: `https://${BUCKET01}.s3.ap-south-1.amazonaws.com/${videoKey
                    .split(".")
                    .slice(0, -1)
                    .join(".")}/subtitle.vtt`,
            });
            setTimeout(
                () => toast.success("Video post created!"),
                1000
            );
        } catch (err) {
            setTimeout(() => toast.error("Failed to create video post"), 1000);
        } finally {
            setIsUploading(false);
        }
    };
    const handleAbort = async () => {
        try {
            await uploadService.abortMultiPartUpload(
                uploadMetaData.uploadId,
                uploadMetaData.videoKey
            );
            setUploadMetaData(null);
            toast.warning("Upload aborted!!");
        } catch (error) {
            toast.error("Failed to abort upload");
        }
    };
    return (
        <Dialog
            open={isVideoModalOpen}
            onOpenChange={() => dispatch(toggleVideoModal())}
        >
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
