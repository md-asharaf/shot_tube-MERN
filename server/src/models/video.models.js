import { Schema, model } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    video: {
        type:String,
        required: true
    },
    thumbnail: {
        type:String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

videoSchema.plugin(MAP);

export const Video = model("Video", videoSchema)