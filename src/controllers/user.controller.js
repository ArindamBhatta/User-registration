import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { json } from "express";

const generateAccessAndRepressToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      "Someone went wrong while generating refresh and access token"
    );
    return { accessToken, refreshToken };
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  console.log(`email: ${email}, fullname: ${fullname}, password: ${password}`);

  if ([fullname, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All field are require");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email and username already exist");
  }
  console.log("File description:", req.files);
  console.log("Avatar file description:", req.files?.avatar);
  console.log("Cover image description:", req.files?.coverImage);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    console.log(avatarLocalPath);
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  //hear we create a new instance
  const user = await User.create({
    fullname: fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    username: username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(
    "Create user after removing password and refresh-Token =>",
    createdUser
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log("req object from client is", req.body);
  if (!username || !email) {
    throw new ApiError(400, "Username or email is require");
  }

  //aggregation pipeline for finding the whole value
  const user = await User.findOne({
    $or: [{ username }, { email }],
  }); //return a boolean value

  console.log("mongodb return user is", user);

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  //now if user is their so check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invaled User  credentials");
  }
  const { accessToken, refreshToken } =
    await generateAccessAndRepressToken.apply(user._id);

  //again call athe database to send data to
  const logginUser = User.findById(user._id).select("-password -refreshToken");

  console.log("logginUser is", logginUser);

  //for secure http headers
  const options = {
    httpOnly: true,
    security: true,
  };

  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logginUser,
          accessToken,
          refreshToken,
        },
        "User loggin successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: false,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    security: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
export { registerUser, loginUser, logoutUser };
