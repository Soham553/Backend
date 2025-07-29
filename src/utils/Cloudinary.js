import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.Cloud_Name, 
    api_key: process.env.Api_Key, 
    api_secret: process.env.Api_Secret
})


const uploadimage = async (LocalFilePath) => {
    try {

        if(!LocalFilePath) return null;
        const res = await cloudinary.uploader.upload(LocalFilePath);
        console.log(res.url);
        fs.unlinkSync(LocalFilePath);
        return res;

    } catch (error) {
        console.log(error)
        
    }
}

export {uploadimage}