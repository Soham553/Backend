import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verfiyjwt = asyncHandler ( async (req, res, next) => {

    try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer', '');
            const verification = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
            if(!verification){
                throw new ApiErrors(400, "Wrong token");
            }
        
            const user = await User.findById(verification?._id);
        
            if(!user){
                throw new ApiErrors(400, "Not present user or wrong token");
            }
        
            req.user = user;
            next();
    } 
    catch (error) {
        throw new ApiErrors(401, error?.message || "Wrong while auth middleware");
    }

})