import { Schema, model } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2";
const shortSchema = new Schema({
    source: {
        type: String,
        default: ""
    },
    thumbnail: {
        type: String,
        default: ""
    },
    subtitle: {
        type: String,
        default: ""
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
    duration:{
        type: Number,
    },
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
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
    thumbnailPreviews:{
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

shortSchema.plugin(MAP);

export const Short = model("Short", shortSchema)