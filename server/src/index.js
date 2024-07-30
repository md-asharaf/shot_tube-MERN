import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";


dotenv.config({
    path: "./.env"
})

connectDB()
    .then(() => {
        app.on('error', (err) => {
            console.log('Server error:\n', err)
        })
        app.listen(process.env.PORT || 4000, () => {
            console.log(`⚙️  server is running at port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log('MonGO db connection error:\n', err)
    })