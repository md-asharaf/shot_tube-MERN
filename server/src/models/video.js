import { Schema, model } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    source: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ""
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
    thumbnailPreviews: {
        type: String,
        default: ""
    },
    tags: {
        type: [String],
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

videoSchema.plugin(MAP);

export const Video = model("Video", videoSchema)