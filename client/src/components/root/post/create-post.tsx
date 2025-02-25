import { Card, CardContent } from "@/components/ui/card";
import { AvatarImg } from "../avatar-image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FilmIcon,
  ImageIcon,
  ListIcon,
  SquareCheckBigIcon,
} from "lucide-react";
import { useState } from "react";
import { ImageUploader } from "./image-uploader";
import { ImagePoll } from "./image-poll";
import { TextPoll } from "./text-poll";
import { Quiz } from "./quiz";
import { set } from "date-fns";
export const CreatePost = () => {
  const [postType, setPostType] = useState<
    "text" | "image" | "text-poll" | "image-poll" | "video" | "quiz"
  >("text");
  const [imagePollData, setImagePollData] = useState({});
  const [textPollData, setTextPollData] = useState({});
  const [quizData, setQuizData] = useState({});
  const [imagePostData, setImagePostData] = useState({});
  const [videoPostData, setVideoPostData] = useState({});
  const [textPostData, setTextPostData] = useState({});
  const { fullname, avatar } =
    useSelector((state: RootState) => state.auth.userData) || {};
  const props =
    postType === "image-poll"
      ? { data: imagePollData, setData: setImagePollData }
      : postType === "text-poll"
      ? { data: textPollData, setData: setTextPollData }
      : postType === "image"
      ? { data: imagePostData, setData: setImagePostData }
      : postType === "quiz"
      ? {
          data: quizData,
          setData: setQuizData,
        }
      : postType === "text"
      ? {
          data: textPostData,
          setData: setTextPostData,
        }
      : {
          data: videoPostData,
          setData: setVideoPostData,
        };
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
          <div className="flex flex-col space-y-4 items-center">
            <Textarea
              className="resize-none"
              placeholder="What's on your mind?"
            />
            {(() => {
              const renderResult = (
                <RenderPostInput postType={postType} props={props} />
              );
              if (renderResult === null) {
                setPostType("text");
                return null;
              }
              return renderResult;
            })()}
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex justify-start items-center md:justify-normal">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setPostType("image");
                  setImagePostData({ text: "", image: "" });
                }}
              >
                <ImageIcon className="mr-1" /> Image
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setPostType("image-poll");
                  setImagePollData({
                    question: "",
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
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setPostType("text-poll");
                  setTextPollData({ question: "", options: ["", ""] });
                }}
              >
                <ListIcon className="mr-1" /> Text Poll
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setPostType("quiz");
                  setQuizData({
                    question: "",
                    options: ["", ""],
                    correct: 0,
                    explanation: "",
                  });
                }}
              >
                <SquareCheckBigIcon className="mr-1" />
                Quiz
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setPostType("video");
                  setVideoPostData({ text: "", video: "" });
                }}
              >
                <FilmIcon className="mr-1" />
                Video
              </Button>
            </div>
            <div className="flex items-center justify-end md:justify-normal  space-x-2">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setPostType("text");
                  setTextPostData({ text: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 rounded-full text-white"
                size="lg"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
const RenderPostInput = ({
  props,
  postType,
}: {
  postType: string;
  props: any;
}) => {
  switch (postType) {
    case "image":
      return <ImageUploader {...props} />;
    case "image-poll":
      return <ImagePoll {...props} />;
    case "text-poll":
      return <TextPoll {...props} />;
    case "quiz":
      return <Quiz {...props} />;
    default:
      return null;
  }
};
