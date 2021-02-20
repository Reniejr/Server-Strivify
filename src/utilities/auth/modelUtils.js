const bcrypt = require("bcryptjs");

const findMethod = (userModel) => {
  return (userModel.statics.findByCredentials = async function (
    username,
    email,
    password
  ) {
    let user;
    username !== undefined || username !== null
      ? (user = await userModel.findOne({ username }))
      : (user = await userModel.findOne({ email }));
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  });
};

const jsonMethod = (userModel, keys) => {
  return (userModel.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    keys.map((key) => delete userObj[key]);
    return userObj;
  });
};

const preSave = (userModel) => {
  return userModel.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    next();
  });
};

module.exports = { findMethod, jsonMethod, preSave };
