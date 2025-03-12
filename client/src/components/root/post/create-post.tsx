import { Card, CardContent } from "@/components/ui/card";
import { AvatarImg } from "../avatar-image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import {
  FilmIcon,
  ImageIcon,
  ListIcon,
  Loader2,
  SquareCheckBigIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ImageUploader } from "./image-uploader";
import { ImagePoll } from "./image-poll";
import { TextPoll } from "./text-poll";
import { Quiz } from "./quiz";
import { VideoPost } from "./video-post";
import { TextPost } from "./text-post";
import { useMutation } from "@tanstack/react-query";
import { postService } from "@/services/post";
import { toast } from "sonner";
export const CreatePost = () => {
  const [postType, setPostType] = useState<
    "text" | "image" | "text-poll" | "image-poll" | "video" | "quiz"
  >("text");
  const [data, setData] = useState<any>({ text: "" });
  const [Post, setPost] = useState(null);
  const { fullname, avatar } =
    useSelector((state: RootState) => state.auth.userData) || {};
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      await postService.createPost({ type: postType, ...data });
    },
    onSuccess: () => {
      toast.success("Post created successfully");
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });
  const reset = () => {
    setPostType("text");
    setData({ text: "" });
  };
  const getComponent = () => {
    switch (postType) {
      case "image":
        return <ImageUploader data={data} setData={setData} reset={reset} />;
      case "image-poll":
        return <ImagePoll data={data} setData={setData} reset={reset} />;
      case "text-poll":
        return <TextPoll data={data} setData={setData} reset={reset} />;
      case "quiz":
        return <Quiz data={data} setData={setData} reset={reset} />;
      case "video":
        return <VideoPost data={data} setData={setData} />;
      case "text":
        return <TextPost data={data} setData={setData} />;
      default:
        return null;
    }
  };
  const isPostDisabled = () => {
    switch (postType) {
      case "text":
        return !data.text || data.text.trim() === "";
      case "image":
        return (
          !data.text ||
          data.text.trim() === "" ||
          !data.images ||
          data.images.length === 0
        );
      case "text-poll":
        return (
          !data.text ||
          data.text.trim() === "" ||
          !data.options ||
          data.options.length < 2 ||
          data.options.some((opt: string) => !opt || opt.trim() === "")
        );
      case "image-poll":
        return (
          !data.text ||
          data.text.trim() === "" ||
          !data.options ||
          data.options.length < 2 ||
          data.options.some(
            (opt: { image: string; text: string }) =>
              !opt.text ||
              opt.text.trim() === "" ||
              !opt.image ||
              opt.image.trim() === ""
          )
        );
      case "quiz":
        return (
          !data.text ||
          data.text.trim() === "" ||
          !data.options ||
          data.options.length < 2 ||
          data.options.some((opt: string) => !opt || opt.trim() === "") ||
          data.correct === -1
        );
      case "video":
        return (
          !data.text ||
          data.text.trim() === "" ||
          !data.video ||
          data.video.trim() === ""
        );
      default:
        return true;
    }
  };
  useEffect(() => {
    setPost(getComponent());
  }, [postType, data]);

  return (
    <Card className="max-w-4xl">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AvatarImg
                avatar={avatar}
                fullname={fullname}
                className="w-10 h-10"
              />
              <h1>{fullname}</h1>
            </div>
            <div className="text-muted-foreground">Visibility: Public</div>
          </div>
          {Post ?? "loading"}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex justify-start items-center md:justify-normal">
              <Button
                variant={postType == "image" ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setPostType("image");
                  setData({ text: "", images: [] as File[] });
                }}
              >
                <ImageIcon className="mr-1" /> Image
              </Button>
              <Button
                variant={postType == "image-poll" ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setPostType("image-poll");
                  setData({
                    text: "",
                    options: [
                      { image: "", text: "" },
                      { image: "", text: "" },
                    ],
                  });
                }}
              >
                <ListIcon className="mr-1" /> Image Poll
              </Button>
              <Button
                variant={postType == "text-poll" ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setPostType("text-poll");
                  setData({ text: "", options: ["", ""] });
                }}
              >
                <ListIcon className="mr-1" /> Text Poll
              </Button>
              <Button
                variant={postType == "quiz" ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setPostType("quiz");
                  setData({
                    text: "",
                    options: ["", ""],
                    correct: -1,
                    explanation: "",
                  });
                }}
              >
                <SquareCheckBigIcon className="mr-1" />
                Quiz
              </Button>
              <Button
                variant={postType == "video" ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setPostType("video");
                  setData({ text: "", video: "" });
                }}
              >
                <FilmIcon className="mr-1" />
                Video
              </Button>
            </div>
            <div className="flex items-center justify-end md:justify-normal  space-x-2">
              <Button
                variant={postType !== "text" ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setPostType("text");
                  setData({ text: "" });
                }}
                disabled={isPostDisabled() || isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 rounded-full text-white"
                size="lg"
                onClick={() => createPost()}
                disabled={isPostDisabled() || isPending}
              >
                {isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
