import { IPostData } from "@/interfaces";
import { AvatarImg } from "../avatar-image";
import {
    EllipsisVerticalIcon,
    MessageSquareMoreIcon,
    Share2Icon,
    ThumbsUpIcon,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
export const PostCard = ({ post }: { post: IPostData }) => {
    const { avatar, fullname } =
        useSelector((state: RootState) => state.auth.userData) || {};
    return (
        <Card className="max-w-4xl w-full  p-2">
            <CardContent className="flex items-start justify-between space-x-4 w-full p-2">
                <div>
                    <AvatarImg
                        avatar={avatar}
                        fullname={fullname}
                        className="h-10 w-10"
                    />
                </div>
                <div className="flex flex-col space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                        <div>{fullname}</div>{" "}
                        <div className="text-xs text-muted-foreground">{`${formatDistanceToNowStrict(
                            new Date(post.updatedAt)
                        ).replace("about", "ago")}`}</div>
                    </div>
                    <div>{post.text}</div>
                    <div>
                        <img src={post.images?.[0]} />
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            className="rounded-full [&_svg]:size-5"
                        >
                            <ThumbsUpIcon />
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-full [&_svg]:size-5"
                        >
                            <Share2Icon />
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-full [&_svg]:size-5"
                        >
                            <MessageSquareMoreIcon />
                        </Button>
                    </div>
                </div>
                <div>
                    <EllipsisVerticalIcon />
                </div>
            </CardContent>
        </Card>
    );
};
