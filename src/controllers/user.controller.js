import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
// import { upload } from "../middlewares/multer.middleware.js";
import { uploadimage} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js" 



const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId); 

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(); 
    console.log("access and refresh : ", accessToken, refreshToken);

    user.refreshToken = accessToken; 

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, "Sorry for inconvenience");
  }
};


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



const login = asyncHandler(async (req, res) => {
    console.log(req.body);
    const {email, username, password} = req.body;
    console.log(email);
    console.log(username);
    
    const existUser = await User.findOne({
        $or : [{email}, {username}]
    })

    if(!existUser || !username){
        throw new ApiErrors(400, "Please enter username or email");
    }


    if(!existUser){
        throw new ApiErrors(404, "User does not exist");
    }
    
    const pass = await existUser.isPasswordCorrect(password);

    if(!pass){
        throw new ApiErrors(404, "Invalid crediential")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(existUser._id);

    const option = {
        httponly : true,
        secure : true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(

            new ApiErrors(
                200,
                {
                    existUser : 
                    refreshToken,
                    accessToken
                }
            )
        )


})


const logout = asyncHandler(async (req, res) => {
    await User.findById(
        req.cookie._id,
       { $set : {
            refreshToken : undefined
         }
       },
       {
        new : true
       }
    )

    return res
        .status(200)
        .cleareCookie("accessToken", option)
        .cleareCookie("refreshToken", option)
        .json(new ApiErrors(200, {}, "User Loged out successfuly"))
})






export {
    registerUser,
    login,
    logout
}