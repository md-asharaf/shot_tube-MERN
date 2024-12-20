import connectDB from "./db/index.js";
import { app } from "./app.js";
connectDB()
    .then(() => {
        app.on('error', (err) => {
            console.error('Server error:\n', err)
        })
        app.listen(process.env.PORT || 4000, () => {
            console.log(`⚙️  server is running at port ${process.env.PORT || 4000}`);
        })
    })
    .catch((err) => {
        console.error('MonGO db connection error:\n', err)
    })