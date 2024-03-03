import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

console.log("Hii i am cloudanry api key", process.env.CLOUDINARY_API_KEY);
console.log("Hii i am cloudanry API SECRET", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: "dualndkhq",
  api_key: "189913735336184",
  api_secret: "3y05PgGrWJhxAroaGNGWztyOwwk",
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log(`file path is their on argument => => ${localFilePath}`);
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    console.log("(2) Cloudnary whole responce", response);
    //fs.unlinkSync(localFilePath);
    return response;
    //
  } catch (error) {
    console.log(`File doesn't uplode on cloudanary => ${error}`);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed syncronusly
    return null;
  }
};

export { uploadOnCloudinary };
