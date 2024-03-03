/*
  user verification is going their =>
  1) user ka jkon loggin koralam ami access ar refresh token duto e dia dilm. 
  2) verefyjwt variable  is becaused we checked true accesstoken and refresh token are their
  3) if true value is their so req.user bla akta middlewire banabo
*/

import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"; //value decode korbar jonno
import { User } from "../models/user.model";

dotenv.config();

if (process.env.PORT) {
  console.log("environment variable is configure in auth middlewire ");
} else {
  console.log("PORT is not set");
}

//higher order function
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    //so, token ar access ke vba nbo?
    //controller ar  login function a res.cookie client ka last a send korachi
    const token =
      req.cookies?.accessToken ||
      //mobile a costom header how to send?
      //goto postman Headers portion =>  key Authorization value Bearer space tokenname => Accesstoken
      req.header("Authorization").replace("Bearer", ""); //for mobile data
    console.log("cookies is in token", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    console.log("Access token is", process.env.ACCESS_TOKEN_SECRET);
    //token to pya glam  but ata ke thik ar information

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //decodeinfo plam mja mja await korta hoy

    const user = await User.findById(decodedToken?._id).select(
      //ar kacha poro user ar puro data asba
      "-password -refreshToken"
    );
    console.log("user after unselect password and refreshToken => ", user); //check alo ke na puro ta

    if (!user) {
      // NEXT_VIDEO: discuss about frontend
      throw new ApiError(401, "Invalid Access Token");
    }
    //to user asa gacha 100% sure. to req ar option acha ar use hba route a
    req.user = user; //just like req.cookie we create req.user object
    next(); //for logout function call
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
