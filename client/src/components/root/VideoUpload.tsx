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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";

const VideoUpload = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const [loader, setLoader] = useState<boolean>(false);
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

    const uploadVideo = async (values: IVideoForm) => {
        setLoader(true);
        const { title, description, video, thumbnail } = values;
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("video", video[0]);
        formData.append("thumbnail", thumbnail[0]);

        try {
            const response = await videoService.upload(formData);
            dispatch(toggleVideoModal());
            toast({
                title: "Video uploaded successfully",
                description: "Your video is now live",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Failed to upload video",
                description: "Please login first",
            });
        } finally {
            setLoader(false);
        }
    };
    return (
        <div className="w-screen h-screen fixed top-0 right-0 bg-[#0000009e] dark:bg-[#5756569e] z-30">
            <Card
                className={`shadow-xl shadow-transparent border-[1px] border-gray-500 dark:border-zinc-600 rounded-md p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:bg-black z-40 sm:w-[400px] w-[70vw]`}
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
                                    {loader ? (
                                        <Loader2 className="animate-spin h-4 w-4">
                                            Uploading...
                                        </Loader2>
                                    ) : (
                                        "Publish"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant={"destructive"}
                                    onClick={() => {
                                        dispatch(toggleVideoModal());
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
