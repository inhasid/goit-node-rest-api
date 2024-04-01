import { Schema, model } from "mongoose";

import { handleSaveError, setUpdateSetting } from "./hooks.js";
import { emailRegexp } from "../constants/user-constants.js";

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: 6,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: emailRegexp,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", setUpdateSetting);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

export default User;
