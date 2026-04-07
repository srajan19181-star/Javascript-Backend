import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';    //file system

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {try {

    if(!localFilePath) return null;
    //file upload
    const response = await cloudinary.uploader.upload(localFilePath,{reference_type: "auto"})
    //file uploaded successfully
    console.log("file uploaded successfully on cloudinary")
    response.url()
    return response;
    
} catch (error) {
    fs.unlinkSync(localFilePath) // file removed from the local saved temporary as the upload gets failed
    return null;
    
}}


export default uploadOnCloudinary


