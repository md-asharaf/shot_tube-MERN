import { model, Schema } from "mongoose";
const likeSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    shortId: {
        type: Schema.Types.ObjectId,
        ref: "Short",
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
    replyId: {
        type: Schema.Types.ObjectId,
        ref: "Reply",
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });


export const Like = model("Like", likeSchema);