import { model, Schema } from "mongoose";
const playListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });


export const PlayList = model("PlayList", playListSchema);