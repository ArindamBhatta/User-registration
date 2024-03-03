import mongoose, { Schema } from "mongoose";
import Jwt from "jsonwebtoken"; //key store in env
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //for searching parpose in database optimise
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      require: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      require: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      require: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
/*if user click the save  button  pasword encript is start. but if i am saving my photo than also my pasword start encription so only it will update when pasword is save*/

//pre and post hooks
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //if password doesn't modified return
  this.password = bcrypt.hash(this.password, 10); //this is empty object it's a new variable and 10 is layer
  console.log("password after encript", this.password);
  next();
});

//create a custom hooks, an inbuild function isPasswordCorrect
userSchema.method.isPasswordCorrect = async function (password) {
  //this Argument password send by user in login req
  return await bcrypt.compare(password, this.password); //this.password is a empty object where we store bcrypt password
};

userSchema.method.generateAccessToken = function () {
  //for genrate token
  Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.method.generateRefreshToken = function () {
  Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
