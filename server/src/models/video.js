import { Schema, model } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    source: {
        type: String,
        required: true,
    },
    sourceStatus:{
        type: String,
        enum: ["FAILED","PROCESSING","READY"],
        default: "PROCESSING"
    },
    subtitleStatus:{
        type: String,
        enum: ["FAILED","PROCESSING","READY"],
        default: "PROCESSING"
    },
    thumbnail: {
        type: String,
    },
    subtitle: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
    },
    views: {
        type: Number,
        default: 0
    },
    visibility:{
        type: String,
        enum: ["public","private"],
        default: "private"
    },
    thumbnailPreviews: {
        type: String,
        default: ""
    },
    categories: {
        type: [String],
        default: []
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

videoSchema.plugin(MAP);

export const Video = model("Video", videoSchema)