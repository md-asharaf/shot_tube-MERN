import Axios from "@/lib/axios";
import { IPostData } from "@/interfaces";

class PostService {
    getPostById = async (id: string) => await Axios.get(`/posts/${id}`);
    createPost = async (data:any) =>
        await Axios.post("/posts/create-post",data);
    updatePost = async (postId: string, post: IPostData) =>
        await Axios.patch(`/posts/update-post/${postId}`, post);
    deletePost = async (postId: string) =>
        await Axios.delete(`/posts/delete-post/${postId}`);
    getUserPosts = async (username: string) =>
        await Axios.get(`/posts/all-posts/${username}`);
}

export const postService = new PostService();
