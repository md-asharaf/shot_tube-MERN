import { model, Schema } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2"
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
replySchema.plugin(MAP);
export const Reply = model("Reply", replySchema);
