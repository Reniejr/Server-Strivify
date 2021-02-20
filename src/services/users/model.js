const mongoose = require("mongoose"),
  { Schema } = require("mongoose"),
  {
    findMethod,
    jsonMethod,
    preSave,
  } = require("../../utilities/auth/modelUtils");

const UsersModel = new Schema(
  {
    googleId: { type: String },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    profile: { type: String },
    refresh_token: [{ token: { type: String } }],
  },
  { timestamps: true }
);

findMethod(UsersModel);

let keys = ["password", "__v"];
jsonMethod(UsersModel, keys);
preSave(UsersModel);

module.exports = mongoose.model("users", UsersModel);
