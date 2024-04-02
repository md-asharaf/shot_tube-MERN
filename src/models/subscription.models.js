import { Schema, model } from "mongoose";


const subscriptionSchema = new Schema({
    subscriber: {
        type: [{
            type: Schema.Types.ObjectId,//those who are subscribing
            ref: "User"
        }],

    },
    channel: {
        type: Schema.Types.ObjectId, //one who is being subscribed
        ref: "User"
    }

}, { timestamps: true });


export const Subscription = model("Subscription", subscriptionSchema);