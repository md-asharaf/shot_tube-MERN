import axios from "@/lib/axios";
import { IPostData } from "@/interfaces";

class PostService {
    getPostById = async (id: string) => await axios.get(`/posts/${id}`);
    createPost = async (data:any) =>
        await axios.post("/posts/create-post",data);
    updatePost = async (postId: string, post: IPostData) =>
        await axios.patch(`/posts/update-post/${postId}`, post);
    deletePost = async (postId: string) =>
        await axios.delete(`/posts/delete-post/${postId}`);
    getUserPosts = async (username: string) =>
        await axios.get(`/posts/all-posts/${username}`);
}

export const postService = new PostService();
