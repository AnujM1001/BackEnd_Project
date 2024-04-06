import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinatry = async (localFilepath) => {
  try {
    if (!localFilepath) return null;

    const uploadResponse = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });
    console.log("file uploaded successfully", uploadResponse.url);
  } catch (err) {
    fs.unlinkSync(localFilepath); // remove the local temp file
  }
};

export { uploadOnCloudinatry };
