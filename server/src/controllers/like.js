import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.js";
import { Reply } from "../models/reply.js";
import { Video } from "../models/video.js";
import { Tweet } from "../models/tweet.js"
import { publishNotification } from "../lib/kafka/producer.js";
import { Short } from "../models/short.js";
class LikeController {
    toggleCommentLike = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const user = req.user;
        if (!commentId) {
            throw new ApiError(400, "Comment id is required")
        }
        const dbLike = await Like.findOne({ commentId: new mongoose.Types.ObjectId(commentId), userId: user._id })
        if (!dbLike) {
            const like = await Like.create({
                commentId,
                userId: user._id
            })
            // publishing notification
            const comment = await Comment.findById(commentId);
            if (like && !comment.userId.equals(user._id)) {
                const video = await Video.findById(comment.videoId)
                const message = `@${user.username} liked your comment: "${comment.content}"`;
                publishNotification({
                    userId: comment.userId,
                    message,
                    video: {
                        _id: video._id,
                        thumbnail: video.thumbnail,
                    },
                    creator: {
                        _id: user._id,
                        avatar: user.avatar,
                        fullname: user.fullname
                    },
                    read: false,
                    createdAt: new Date(Date.now()),
                });
            }
            //end
        }
        else {
            await Like.findByIdAndDelete(dbLike._id)
        }

        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} comment`))
    })
    toggleVideoLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const user = req.user;
        if (!videoId) throw new ApiError(400, "Video id is required");
        const dbLike = await Like.findOne({ videoId: new mongoose.Types.ObjectId(videoId), userId: user._id });
        if (!dbLike) {
            const like = await Like.create({
                videoId,
                userId: user._id
            })
            // publishing notification
            const video = await Video.findById(videoId)
            if (like && !video.userId.equals(user._id)) {
                console.log(video.userId, user._id)
                const message = `@${user.username} liked your video: "${video.title}"`;
                publishNotification({
                    userId: video.userId,
                    message,
                    video: {
                        _id: video._id,
                        thumbnail: video.thumbnail,
                    },
                    creator: {
                        _id: user._id,
                        avatar: user.avatar,
                        fullname: user.fullname
                    },
                    read: false,
                    createdAt: new Date(Date.now()),
                });
            }
            //end
        }
        else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} video`));
    })
    toggleShortLike = asyncHandler(async (req, res) => {
        const { shortId } = req.params;
        const user = req.user;
        if (!shortId) throw new ApiError(400, "short id is required");
        const dbLike = await Like.findOne({ shortId: new mongoose.Types.ObjectId(shortId), userId: user._id });
        if (!dbLike) {
            const like = await Like.create({
                shortId,
                userId: user._id
            })
            // publishing notification
            const short = await Short.findById(shortId)
            if (like && !short.userId.equals(user._id)) {
                console.log(short.userId, user._id)
                const message = `@${user.username} liked your short: "${short.title}"`;
                publishNotification({
                    userId: short.userId,
                    message,
                    short: {
                        _id: short._id,
                        thumbnail: short.thumbnail,
                    },
                    creator: {
                        _id: user._id,
                        avatar: user.avatar,
                        fullname: user.fullname
                    },
                    read: false,
                    createdAt: new Date(Date.now()),
                });
            }
            //end
        }
        else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} short`));
    })
    toggleTweetLike = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const user = req.user;
        if (!tweetId) throw new ApiError(400, "Tweet id is required");
        const dbLike = await Like.findOne({ tweetId: new mongoose.Types.ObjectId(tweetId), userId: user._id })
        if (!dbLike) {
            const like = await Like.create({
                userId: user._id,
                tweetId,
            })
            // publishing notification
            const tweet = await Tweet.findById(tweetId)
            if (like && !tweet.userId.equals(user._id)) {
                const message = `@${user.username} liked your post: "${tweet.content}"`;
                publishNotification({
                    userId: tweet.userId,
                    message,
                    tweet: {
                        _id: tweet._id,
                        image: tweet.image,
                    },
                    creator: {
                        _id: user._id,
                        avatar: user.avatar,
                        fullname: user.fullname
                    },
                    read: false,
                    createdAt: new Date(Date.now()),
                });
            }
            //end
        } else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} tweet`))
    })
    toggleReplyLike = asyncHandler(async (req, res) => {
        const { replyId } = req.params;
        const user = req.user;
        if (!replyId) throw new ApiError(400, "Reply id is required");
        const dbLike = await Like.findOne({ replyId: new mongoose.Types.ObjectId(replyId), userId: user._id });
        if (!dbLike) {
            const like = await Like.create({
                userId: user._id,
                replyId,
            })
            // publishing notification
            const reply = await Reply.findById(replyId)
            if (like && !reply.userId.equals(user._id)) {
                const comment = await Comment.findById(reply.commentId)
                const video = await Video.findById(comment.videoId)
                const message = `@${user.username} liked your reply: "${reply.content}"`;
                publishNotification({
                    userId: reply.userId,
                    message,
                    video: {
                        _id: video._id,
                        thumbnail: video.tumbnail,
                    },
                    creator: {
                        _id: user._id,
                        avatar: user.avatar,
                        fullname: user.fullname
                    },
                    read: false,
                    createdAt: new Date(Date.now()),
                });
            }
            //end
        } else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} reply`))
    })
    likesCount = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        if (!videoId && !shortId) {
            throw new ApiError(400, "video id or short id is required")
        }
        let likesCount = 0;
        if (videoId) {
            likesCount = await Like.countDocuments({ videoId })
        } else {
            likesCount = await Like.countDocuments({ shortId })
        }
        return res.status(200).json(new ApiResponse(200,{likesCount},"likes fetched successfully"))
    })
    isLiked = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        const userId = req.user?._id;
        if (!videoId && !shortId) throw new ApiError(400, "video id or short id is required");
        let isLiked = false;
        if (videoId) {
            isLiked = await Like.findOne({ videoId: new mongoose.Types.ObjectId(videoId), userId });
        } else {
            isLiked = await Like.findOne({ shortId: new mongoose.Types.ObjectId(shortId), userId });
        }
        return res.status(200).json(new ApiResponse(200, { isLiked }, `user has${isLiked ? "" : " not"} liked this video`))
    })
    videoCommentsLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!videoId) throw new ApiError(400, "Video id is required");
        const comments = await Comment.find({
            videoId: new mongoose.Types.ObjectId(videoId),
        })
        let isLiked = {};
        for (let comment of comments) {
            isLiked[comment._id] = { status: !!(await Like.findOne({ commentId: comment._id, userId })), count: await Like.countDocuments({ commentId: comment._id }) }
        }
        return res.status(200).json(new ApiResponse(200, { isLiked }, "User has liked these comments"))
    })
    shortCommentsLike = asyncHandler(async (req, res) => {
        const { shortId } = req.params;
        const userId = req.user?._id;
        if (!shortId) throw new ApiError(400, "short id is required");
        const comments = await Comment.find({
            shortId: new mongoose.Types.ObjectId(shortId),
        })
        let isLiked = {};
        for (let comment of comments) {
            isLiked[comment._id] = { status: !!(await Like.findOne({ commentId: comment._id, userId })), count: await Like.countDocuments({ commentId: comment._id }) }
        }
        return res.status(200).json(new ApiResponse(200, { isLiked }, "User has liked these comments"))
    })
    commentRepliesLike = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId) throw new ApiError(400, "Comment id is required");
        const replies = await Reply.find({
            commentId: new mongoose.Types.ObjectId(commentId)
        })
        let isLiked = {};
        for (let reply of replies) {
            isLiked[reply._id] = { status: !!(await Like.findOne({ replyId: reply._id, userId })), count: await Like.countDocuments({ replyId: reply._id }) }
        }
        return res.status(200).json(new ApiResponse(200, { isLiked }, "User has liked these replies"))
    })
}

export default new LikeController();
