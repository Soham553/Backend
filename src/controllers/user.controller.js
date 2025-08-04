import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
// import { upload } from "../middlewares/multer.middleware.js";
import { uploadimage} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js" 
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId); 

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(); 

    user.refreshToken = accessToken; 

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, "Sorry for inconvenience");
  }
};

const registerUser = asyncHandler(async (req, res) => {
    const {email, fullName, username, password} = req.body;

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
    const {email, username, password} = req.body;

    if(!(email || username)){
        throw new ApiErrors(400, "Please enter username or email");
    }

    const existUser = await User.findOne({
        $or : [{email}, {username}]
    })

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
  const userId = req.user._id; 

  if (!userId) {
    throw new ApiErrors(400, "User ID not found in cookies");
  }

  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: undefined } }, 
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options) 
    .clearCookie("refreshToken", options)
    .json(new ApiErrors(200, {}, "User logged out successfully"));
});

const refreshAccessrefreshToken = asyncHandler(async (req, res) => {
    const incomeingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomeingrefreshtoken){
        throw new ApiErrors(401, "Invalid refresh token")
    }

   try {
     console.log("this is token : ", incomeingrefreshtoken);
     const decode = jwt.verify(incomeingrefreshtoken, process.env.REFRESH_TOKEN_SECRET);
 
     const findUser = await User.findById(decode._id);

     if(!findUser){
         throw new ApiErrors(401, "No such user is present")
     }
 
     const {newaccess, newrefresh} = generateAccessAndRefreshToken(findUser._id);
 
     const option = {
         httpOnly : true,
         secure : true
     }
 
     return res
     .status(200)
     .cookie("accessToken", newaccess, option)
     .cookie("refreshToken", newrefresh, option)
     .json(
         new ApiResponse(
             200,
             {
                 accessToken : newaccess, refreshToken : newrefresh
             },
             "Refresh done"
             
         )
     )
   } catch (error) {
        throw new ApiErrors(500, error)
   }
})

const changepass = asyncHandler( async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const new_password = req.body.new_pass;

    if(((email || username || password) && !(new_password) ) ){
        throw new ApiErrors(400, "invalid credientials give full info")
    }

    if(password == new_password){
        throw new ApiErrors(400, "Old and new password are same")
    }

    const user = await User.findOne({
        $or : [{email}, {username}]
    })

    if(!user){
        throw new ApiErrors(404, "Username or email is not valid");
    }

     const pass = await user.isPasswordCorrect(password);

     if(!pass){
        throw new ApiErrors(404, "Password is incorrect");
    }

    user.password = new_password;
    await user.save({validateBeforeSave : false});

    return res
             .status(200)
             .json(
                new ApiResponse(
                        200,
                        "Password changed sucessfuly"
                    )
             )     
})

export {
    registerUser,
    login,
    logout,
    refreshAccessrefreshToken,
    changepass
}