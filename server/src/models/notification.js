import mongoose from "mongoose";
import MAP from 'mongoose-aggregate-paginate-v2';
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        _id: String,
        thumbnail: String,
        creatorImage: String,
    },
    tweet: {
        _id: String,
        image: String,
        creatorImage: String,
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

notificationSchema.plugin(MAP);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;