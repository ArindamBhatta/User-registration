import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

dotenv.config();

if (process.env.PORT) {
  console.log("environment variable is configure in auth middlewire ");
} else {
  console.log("PORT is not set");
}

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer", "");
    console.log("cookies is in token", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    console.log("Access token is", process.env.ACCESS_TOKEN_SECRET);

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    console.log("user after unselect password and refreshToken => ", user);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
