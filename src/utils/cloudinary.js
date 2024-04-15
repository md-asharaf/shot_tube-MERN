import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class Cloudinary {
    static upload = async (localFilePath, resource_type = "auto") => {
        try {
            if (!localFilePath) return null;
            //upload the file to cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            })
            //file uploaded successfully
            console.log("file uploaded successfully\nFile url:  ", response.url)

            fs.unlinkSync(localFilePath)
            return resource_type == "video" ? {
                video: { url: response.url, public_id: response.public_id },
                duration: response.duration
            } : { url: response.url, public_id: response.public_id };
        } catch (error) {
            fs.unlinkSync(localFilePath);//remove the locally saved temporary file as the upload operation got failed
            return null;
        }
    }
    static delete = async (public_id) => {
        try {
            if (!public_id) return null;
            //delete the file from cloudinary
            const response = await cloudinary.uploader.destroy(public_id);
            //file deleted successfully
            console.log("file deleted successfully")
        } catch (error) {
            console.log("error while deleting file", error.message)
            return null;
        }
    }
}

export { Cloudinary };