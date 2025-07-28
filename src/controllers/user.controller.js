import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadimage} from "../utils/Cloudinary.js"
import { ApiRespinseError } from "../utils/ApiResponseError.js" 


const registerUser = asyncHandler(async (req, res) => {
    

    const {email, fullname, username, password} = req.body;
    console.log(email);

    if([email, fullname, username, password].some((field) => 
        field?.trim() === ""
    )){
        throw new ApiErrors(400, "All field must be fill");
    }

    const existUser = User.findOne({
        $or : [{username}, {email}]
    })

    if(existUser){
        throw new ApiErrors(409, "alerady exist username or email");
    }

    const avatarLocalPath = req.file?.avatar[0]?.path;
    const coverimage = req.file?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiErrors(400, "upload avatar");
    }

    const avatar = await uploadimage(avatarLocalPath);
    const coverimg = await uploadimage(coverimage);

    if(!avatar){
        throw new ApiErrors(400, "Retry to upolad avatar")
    }

    const User = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverimg?.url,
        email,
        password,
        username : username.toLowerCase()
    })

    const createduser = await User.findById.select(
        "-password -refreshToken"
    )

    if(!createduser){
        throw ApiErrors(500, "somthing went wrong while registring user")
    }

    return res.status(201).json(
        new ApiRespinseError(200, createduser, "user register successfuly")
    )
})

export {registerUser}