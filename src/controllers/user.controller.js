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
    //user ar refresh token assign korbo database a
    user.refreshToken = refreshToken;
    //save korbo database a
    await user.save({ validateBeforeSave: false }); //kicked in hya jba password requare
    return { accessToken, refreshToken }; //dia return korbo
  } catch (error) {
    throw new ApiError(
      500,
      "Someone went wrong while generating refresh and access token"
    );
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

  //call the function usermodel
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invaled User  credentials");
  }

  // call generateAccessAndRepressToken()
  const {
    accessToken,
    refreshToken,
  } = //return glo access korbo variable a
    await generateAccessAndRepressToken.apply(user._id);

  /*
    1) user ka information patabo pasword patobo na 
    2)ja user ka findOne dia call korachi or kacha refresh token empty acha
    3) method call koracha  generateAccessAndRepressToken() pora
    4) abar database ka call korbo
  */
  const logginUser = User.findById(user._id).select("-password -refreshToken");
  console.log("logginUser is", logginUser); //new user with refreshToken

  //cookies patabo
  const options = {
    httpOnly: true, //frontend tka modified hba na
    security: true, //https
  };

  return (
    res //responce return korbo client ka
      .status(200)
      .cookie("accessToken", accessToken, options) //key,value pair use korata parchi
      // app.use(cookieParser()); cookie access in two way req.cookie and res.cookie
      //so ata auth.middlewire a access korbo => req.cookies.accessToken
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: logginUser, //if user want to store data
            accessToken,
            refreshToken,
          },
          "User loggin successfully"
        )
      )
  );
});
/* logout kevba korbo
    1. cookies clear korbo 
    2. database tka refreshtoken reset korbo
    3. email or username dia  korta parbo na becaused req.body korla abar from data patata hba. ar user jka chaiba tka logout kora dba.
    4. tahola id pbo kta dia? 
      ans: - middlewire. jbar aga dka kora jay example multer: from ar dta jacah tar sta image o nia jao.
    5. res kora hoycha accessToken  object.cookie so ota tka access korbo
    so abar nijar middlewire banabo auth.middlewire
*/
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    //referce store korbar dokar nai
    req.user._id,
    //ai khan a req.user ar access pya jbo
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //return a new updated value pbo na korla old value dba
    }
  );
  const options = {
    httpOnly: true,
    security: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options) //cookie clear koradbo option o pass korta hba user ar tka
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
export { registerUser, loginUser, logoutUser };
