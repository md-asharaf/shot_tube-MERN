import { Schema, model } from "mongoose";
import MAP from "mongoose-aggregate-paginate-v2";
const shortSchema = new Schema({
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
    duration:{
        type: Number,
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
    views: {
        type: Number,
        default: 0
    },
    thumbnailPreviews:{
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

shortSchema.plugin(MAP);

export const Short = model("Short", shortSchema)