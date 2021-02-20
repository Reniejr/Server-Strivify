const jwt = require("jsonwebtoken");

const createTokens = async (user) => {
  return {
    access_token: await generateJWT(
      { _id: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET
    ),
    refresh_token: await generateJWT(
      { _id: user._id },
      process.env.JWT_REFRESH_TOKEN_SECRET
    ),
  };
};

const generateJWT = (payload, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        expiresIn:
          secret === process.env.JWT_ACCESS_TOKEN_SECRET ? "15m" : "1d",
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

const validateJWT = (token, secret) => {
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

const authenticate = async (user) => {
  try {
    // console.log(user);
    // const access_token = await generateJWT(
    //   { _id: user._id },
    //   process.env.JWT_ACCESS_TOKEN_SECRET
    // );
    // const refresh_token = await generateJWT(
    //   { _id: user._id },
    //   process.env.JWT_REFRESH_TOKEN_SECRET
    // );
    const tokens = await createTokens(user);
    user.refresh_token = user.refresh_token.concat({
      token: tokens.refresh_token,
    });
    await user.save();
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const refreshTokens = async (userModel, oldRefreshToken) => {
  const decoded = await generateJWT(
    { _id: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  const user = await userModel.findOne({ _id: decoded._id });
  if (!user) {
    throw new Error("Access Forbidden");
  }

  const currentRefreshToken = user.refresh_token.find(
    (token) => token.token === oldRefreshToken
  );

  if (!currentRefreshToken) {
    throw new Error("Wrong Refresh Token");
  }

  const tokens = await createTokens(user);

  const newRefreshTokens = user.refresh_token
    .filter((token) => token.token !== oldRefreshToken)
    .concat({ token: tokens.refresh_token });

  user.refresh_token = [...newRefreshTokens];
  await user.save();

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
};

module.exports = { authenticate, validateJWT, refreshTokens };
