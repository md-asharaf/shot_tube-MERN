import { Schema, model } from "mongoose";


const subscriptionSchema = new Schema({
    subscriberId: {
        type: Schema.Types.ObjectId,//who is subscribing
        ref: "User"
    },
    channelId: {
        type: Schema.Types.ObjectId, //one who is being subscribed
        ref: "User"
    }

}, { timestamps: true });


export const Subscription = model("Subscription", subscriptionSchema);