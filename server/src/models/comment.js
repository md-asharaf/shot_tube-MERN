import { model, Schema } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2"
const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    shortId: {
        type: Schema.Types.ObjectId,
        ref: "Short",
    },
    postId:{
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
    commentId:{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    sentiment: {
        type: String,
        required: true
    }
}, { timestamps: true });

commentSchema.plugin(MAP);

export const Comment = model("Comment", commentSchema);