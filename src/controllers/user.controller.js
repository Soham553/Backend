import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
// import { upload } from "../middlewares/multer.middleware.js";
import { uploadimage} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js" 


const registerUser = asyncHandler(async (req, res) => {
    
    console.log("req_body : ",req.body);
    const {email, fullName, username, password} = req.body;
    console.log(email);

    if([email, fullName, username, password].some((field) => 
        field?.trim() === ""
    )){
        throw new ApiErrors(400, "All field must be fill");
    }

    const existUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existUser){
        throw new ApiErrors(409, "alerady exist username or email");
    }
   
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimage = req.files?.coverImage[0]?.path;
    


    if(!avatarLocalPath){
        throw new ApiErrors(400, "upload avatar");
    }

    const avatar = await uploadimage(avatarLocalPath);
    const coverimg = await uploadimage(coverimage);
    
    if(!avatar){
        throw new ApiErrors(400, "Retry to upolad avatar")
    }

    
    const Cuser = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverimg?.url,
        email,
        password,
        username : username.toLowerCase()
    })

     if(!Cuser){
        throw ApiErrors(500, "somthing went wrong while registring user")
    }

    const createduser = await User.findById(Cuser._id).select("-password -refreshToken");
   
    return res.status(201).json(
        new ApiResponse(200, createduser, "user register successfuly")
    )
})

export {registerUser}