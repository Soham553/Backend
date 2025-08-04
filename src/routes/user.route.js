import { Router } from "express";
import { login, logout, registerUser, refreshAccessrefreshToken, changepass } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verfiyjwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    
    registerUser);

router.route("/login").post(login);

router.route("/logout").post(verfiyjwt, logout);
router.route("/refresh").post(refreshAccessrefreshToken);
router.route("/changepass").post(changepass);

export default router;