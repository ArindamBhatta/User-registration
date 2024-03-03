import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

//Db is another content
const connectDB = async () => {
  try {
    const connectionIntance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionIntance.connection.host} `
    ); //kon host a ami connect hochi
  } catch (error) {
    console.log("Mongo Db connection error", error);
    process.exit(1); //node js
  }
};

export default connectDB;
