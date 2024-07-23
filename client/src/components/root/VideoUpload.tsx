import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import videoService from "@/services/video.services";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { toggleVideoModal } from "@/provider/ui.slice";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { VideoFormValidation } from "../ui/validation";
import { useState } from "react";
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
const VideoUpload = () => {
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
    const dispatch = useDispatch();
    const uploadVideo = async (values: IVideoForm) => {
        setLoader(true);
        const { title, description, video, thumbnail } = values;
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("video", video[0]);
        formData.append("thumbnail", thumbnail[0]);
        try {
            await videoService.upload(formData);
            dispatch(toggleVideoModal());
            setLoader(false);
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div className="w-screen h-screen fixed top-0 right-0 bg-[#0000009e] z-30">
            <div
                className={`shadow-xl shadow-black border-2 border-gray-500 rounded-md p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-40 sm:w-[400px] w-[70vw]`}
            >
                <Card
                    className={`shadow-xl shadow-black border-2 border-gray-500 rounded-md p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-40 sm:w-[400px] w-[70vw]`}
                >
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center">
                            Upload Video
                        </CardTitle>
                        <CardDescription className="text-center">
                            fill all the fields to upload a video.
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
                                                    placeholder="enter a title"
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
                                                    placeholder="enter a description"
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
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant={"default"}
                            type="submit"
                            className="mr-4"
                        >
                            {loader ? "Uploading..." : "Publish"}
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
                    </CardFooter>
                </Card>
                {/* <h1 className="text-center font-bold border-b border-blue-200 pb-4">
                    Publish a video
                </h1> */}
            </div>
        </div>
    );
};

export default VideoUpload;
