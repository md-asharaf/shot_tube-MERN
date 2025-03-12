import { IPostData } from "@/interfaces";
export const PostCard = ({ post }: { post: IPostData }) => {
    return (
        <div>
            <h1>{post.text}</h1>
        </div>
    );
};
