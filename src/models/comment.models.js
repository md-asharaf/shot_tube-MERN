import { model, Schema } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2"
const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });

commentSchema.plugin(MAP);

export const Comment = model("Comment", commentSchema);