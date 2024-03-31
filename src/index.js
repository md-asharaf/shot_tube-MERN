import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" })
connectDB()
    .then(() => {
        app.on('error', (err) => {
            console.log('Server error:\n', err)
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running at port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log('MonGO db connection error:\n', err)
    })