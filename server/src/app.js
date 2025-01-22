import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import { errorHandler } from "./utils/handler.js";
import userRoutes from "./routes/user.js";
import tweetRoutes from "./routes/tweet.js";
import commentRoutes from "./routes/comment.js";
import likeRoutes from "./routes/like.js";
import subscriptionRoutes from "./routes/subscription.js";
import videoRoutes from "./routes/video.js";
import playlistRoutes from "./routes/playlist.js";
import notificationRoutes from "./routes/notification.js";
import uploadRoutes from "./routes/upload.js";
import bodyParser from "body-parser"
const app = express();
const ORIGIN = process.env.CLIENT_URL
app.use(cors({
    origin: [ORIGIN],
    credentials: true
}))
app.use(bodyParser.json({
    limit: "30mb"
}))
app.use(bodyParser.urlencoded({
    limit: "30mb",
    extended: true
}))
app.use(express.json());
app.use(express.static("public"))
app.use(cookieParser())
app.use('/test', (req, res) => {
    res.send('Hello World!')
})
app.use("/api/v1/users", userRoutes)

app.use("/api/v1/tweets", tweetRoutes)

app.use("/api/v1/comments", commentRoutes)

app.use("/api/v1/likes", likeRoutes)

app.use("/api/v1/subscriptions", subscriptionRoutes)

app.use("/api/v1/videos", videoRoutes)

app.use("/api/v1/playlists", playlistRoutes)

app.use("/api/v1/uploads", uploadRoutes)

app.use('/api/v1/notifications',notificationRoutes)

app.use(errorHandler)

export { app }