const express = require("express"),
  UsersModel = require("./model"),
  { userUpload } = require("../../utilities/cloudinary"),
  { auth, adminOnly } = require("../../utilities/auth"),
  { authenticate, refreshTokens } = require("../../utilities/auth/tokensTools"),
  passport = require("passport");

//MAIN
const usersRoute = express.Router();

//METHODS
//POST
usersRoute.route("/").post(async (req, res, next) => {
  let body = req.body;
  try {
    let newUser = await UsersModel(body),
      { _id } = await newUser.save();
    res.send(newUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//GET
usersRoute.route("/").get(auth, async (req, res, next) => {
  let usersList;
  try {
    if (req.query) {
      usersList = await UsersModel.find(req.query)
        .populate("playlist")
        .populate("favourites");
    } else {
      usersList = await UsersModel.find()
        .populate("playlist")
        .populate("favourites");
    }
    res.send(usersList);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//GET BY ID
usersRoute
  .route("/admin/:userId")
  .get(auth, adminOnly, async (req, res, next) => {
    let userId = req.params.userId;
    try {
      const user = await UsersModel.findById(userId)
        .populate("playlist")
        .populate("favourites");
      res.send(user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

//GET PROFILE
usersRoute.route("/profile").get(auth, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//PUT
usersRoute
  .route("/admin/:userId")
  .put(auth, adminOnly, async (req, res, next) => {
    let body = req.body;
    let userId = req.params.userId;
    try {
      let editUser = await UsersModel.findByIdAndUpdate(userId, body, {
        runValidators: true,
        new: true,
      });
      res.send(`User with ID : ${userId} has been edited to : ${editUser}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

//EDIT PROFILE
usersRoute.route("/profile").put(auth, async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await user.save();
    res.send(req.user);
    res.send(updates);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//DELETE
usersRoute.route("/:userId").delete(auth, adminOnly, async (req, res, next) => {
  let userId = req.params.userId;
  try {
    const deleteUser = await UsersModel.findByIdAndRemove(userId);
    res.send(`User with ID : ${userId} has been deleted`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//DELETE PROFILE
usersRoute.route("/profile").delete(auth, async (req, res, next) => {
  try {
    await req.user.deleteOne();
    res.send("User Deleted");
  } catch (error) {}
});

//POST IMAGE
usersRoute
  .route("/:userId/profile")
  .post(userUpload.single("user"), async (req, res, next) => {
    try {
      //GET USER
      let userId = req.params.userId;
      let user = await UsersModel.findById(userId);
      //BODY UPDATE
      let body = { ...user.toObject, profile: req.file.path };
      //UPDATE USER WITH PROFILE
      let userWithProfile = await UsersModel.findByIdAndUpdate(userId, body, {
        runValidators: true,
        new: true,
      });
      res.send(
        `PROFILE PIC :${req.file.originalname} has been uploaded to user with ID : ${userId}`
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

//GET TOKENS
usersRoute.route("/authorize").post(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findByCredentials(username, password);
    const tokens = await authenticate(user);
    res.send(tokens);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//GET NEW TOKENS
usersRoute.route("/authorize/refresh_tokens", async (req, res, next) => {
  const oldRefreshToken = req.body.refresh_token;
  if (!oldRefreshToken) {
    const error = new Error("Invalid Refresh Token - Missing or Expired");
    error.httpStatusCode = 400;
    next(error);
  } else {
    try {
      const newTokens = await refreshTokens(UsersModel, oldRefreshToken);
      res.send(newTokens);
    } catch (error) {
      console.log(error);
      const err = new Error("FORBIDDEN - Something went wrong");
      err.httpStatusCode = 403;
      next(err);
    }
  }
});

//LOGOUT DEVICE
usersRoute.route("/logout").post(auth, async (req, res, next) => {
  try {
    req.user.refresh_token = req.user.refresh_token.filter(
      (token) => token.token !== req.body.refresh_token
    );
    await req.user.save();
    res.send(
      `Logged Out - Refresh Token : ${req.body.refresh_token} has been removed`
    );
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//LOGOUT ALL DEVICES
usersRoute.route("/logoutAll").post(auth, async (req, res, next) => {
  try {
    req.user.refresh_token = [];
    await req.user.save();
    // res.send(`User logout`);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//GOOGLE
usersRoute.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//GOOGLE REDIRECT
usersRoute.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    console.log(req.user);
    try {
      //WITH COOKIES
      res.cookie("accessToken", req.user.tokens.access_token, {
        httpOnly: true,
      });
      res.cookie("refreshToken", req.user.tokens.refresh_token, {
        httpOnly: true,
        path: "/users/refreshToken",
      });
      res.redirect("http://localhost:3000/#/home");
      // res.redirect(
      //   `${process.env.FE_URL_DEV}?access_token=${req.user.tokens.access_token}`
      // );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = usersRoute;
