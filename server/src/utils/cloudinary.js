import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class Cloudinary {
    static upload = async (localFilePath, resource_type) => {
        try {
            if (!localFilePath) return null;
            //upload the file to cloudinary
            let response;
            if (resource_type == "video") {
                response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type,
                    eager: [
                        { streaming_profile: 'hd', format: 'm3u8' },
                        { streaming_profile: 'sd', format: 'm3u8' },
                        { streaming_profile: 'ld', format: 'm3u8' }
                    ],
                    eager_async: true
                });
            } else {
                response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type
                });
            }
            fs.unlinkSync(localFilePath);
            //file uploaded successfully
            console.log(`file uploaded successfully\n ${resource_type} url:  `, response.secure_url)

            return resource_type == "video" ? {
                video: { url: response.secure_url, public_id: response.public_id, m3u8: response.playback_url },
                duration: response.duration
            } : { url: response.url, public_id: response.public_id };
        } catch (error) {
            fs.unlinkSync(localFilePath);
            return null;
        }
    }
    static delete = async (public_id) => {
        try {
            if (!public_id) return null;
            //delete the file from cloudinary
            await cloudinary.uploader.destroy(public_id);
            //file deleted successfully
            console.log("file deleted successfully")
        } catch (error) {
            console.log("error while deleting file", error.message)
            return null;
        }
    }
}

export { Cloudinary };