import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import errorHandler from "./utils/errorHandler.js";
import userRoutes from "./routes/user.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import videoRoutes from "./routes/video.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import bodyParser from "body-parser"
const app = express();

//middlewares
app.use(cors({
    origin: process.env.ORIGIN,
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
//routes declaration

app.use("/hello",(req,res)=>{
    res.send("Hello World")
})
app.use("/api/v1/users", userRoutes)

app.use("/api/v1/tweets", tweetRoutes)

app.use("/api/v1/comments", commentRoutes)

app.use("/api/v1/likes", likeRoutes)

app.use("/api/v1/subscriptions", subscriptionRoutes)

app.use("/api/v1/videos", videoRoutes)

app.use("/api/v1/playlists", playlistRoutes)
//error handler
app.use(errorHandler)

export { app }