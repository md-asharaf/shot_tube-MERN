import { Schema, model } from "mongoose";


const subscriptionSchema = new Schema({
    subscriberId: {
        type: [{
            type: Schema.Types.ObjectId,//those who are subscribing
            ref: "User"
        }],

    },
    channelId: {
        type: Schema.Types.ObjectId, //one who is being subscribed
        ref: "User"
    }

}, { timestamps: true });


export const Subscription = model("Subscription", subscriptionSchema);