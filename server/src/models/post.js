import mongoose from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2"
const options = { discriminatorKey: "type", timestamps: true };

const postSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String },
        visibility: { type: String, enum: ["public", "private"], default: "private" }
    },
    options
);
postSchema.plugin(MAP);
export const Post = mongoose.model("Post", postSchema);
