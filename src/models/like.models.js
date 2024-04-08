import { model, Schema } from "mongoose";
const likeSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    tweetId: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });


export const Like = model("Like", likeSchema);