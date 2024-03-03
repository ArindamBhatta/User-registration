import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js"; //multer middlewire for file uplode

const router = Router();

router.route("/register").post(
  //middlewire
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
//sequare route middleware inject verifyJWT hya logout hba next() akdom sase a aro middlewire reference
//so verefyjwt verefy decode sob korba then req.user add kore next() a chola jba
//tahola req.user ar access o pyajbo
router.route("/logout").post(verifyJWT, logoutUser);
export default router;
//export in app.js
