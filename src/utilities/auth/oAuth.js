const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UsersModel = require("../../services/users/model");
const { authenticate } = require("./tokensTools");

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${process.env.GOOGLE_REDIRECT_URL}`,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const newUser = {
        googleId: profile.id,
        userName: profile.displayName,
        email: profile.emails[0].value,
        profile: profile.photos[0].value,
        refresh_tokens: [],
      };

      try {
        const user = await UsersModel.findOne({ googleId: profile.id });
        // console.log(user);
        if (user) {
          const tokens = await authenticate(user);
          // console.log(tokens);
          done(null, { user, tokens });
        } else {
          const createdUser = new UsersModel(newUser);
          await createdUser.save();

          const tokens = await authenticate(createdUser);
          console.log(tokens);

          done(null, { user: createdUser, tokens });
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
