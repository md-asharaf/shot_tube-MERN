import { model, Schema } from "mongoose";
const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    image:{
        type:String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });


export const Tweet = model("Tweet", tweetSchema);