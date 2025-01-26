import { model, Schema } from "mongoose";

const replySchema = new Schema({
    content: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    }
}, { timestamps: true });

export const Reply = model("Reply", replySchema);
