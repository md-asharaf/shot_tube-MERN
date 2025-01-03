import { Schema, model } from "mongoose";


const subscriptionSchema = new Schema({
    subscriberId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channelId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });


export const Subscription = model("Subscription", subscriptionSchema);