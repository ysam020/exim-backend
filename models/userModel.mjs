import mongoose from "mongoose";
import userSchema from "../schemas/userSchema.mjs";

const User = new mongoose.model("User", userSchema);
export default User;
