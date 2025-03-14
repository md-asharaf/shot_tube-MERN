import { toggleMenu } from "@/store/reducers/ui";
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { IPostData } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { postService } from "@/services/post";
import { PostCard } from "../post/post-card";
import { CreatePost } from "../post/create-post";
import { RootState } from "@/store/store";
export const ChannelPosts = () => {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { username: uname } = useSelector(
    (state: RootState) => state.auth.userData
  );
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", username],
    queryFn: async (): Promise<IPostData[]> => {
      const data = await postService.getUserPosts(username);
      return data.posts;
    },
    enabled: !!username,
  });
  return (
    <>
      {username === uname && (
        <div className="px-2">
          <CreatePost />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading ? (
          <div className="flex justify-center w-full">
            <Loader2 className="h-10 w-10 animate-spin" strokeWidth={1.5} />
          </div>
        ) : (
          posts?.map((post, index) => (
            <Link
              to={`/post/${post._id}`}
              onClick={() => dispatch(toggleMenu())}
              key={index}
              className="rounded-lg"
            >
              <PostCard post={post} />
            </Link>
          ))
        )}
      </div>
    </>
  );
};
