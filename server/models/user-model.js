import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
});
const userModel = model("User", userSchema);
export default userModel;
