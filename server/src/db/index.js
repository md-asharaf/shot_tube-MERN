import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { Notification } from "../models/notification.js";

const connectDB = async () => {
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("DATABASE CONNECTED!!\nDB HOST: ", connectionResponse.connection.host);
    } catch (error) {
        console.error("DATABASE CONNECTION ERROR\n", error);
        process.exit(1);
    }
}

export const insertNotifications = async (notifications) => {
    try {
        return await Notification.insertMany(notifications);
    } catch (error) {
        throw error;
    }
}
export default connectDB;