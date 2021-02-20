//MAIN IMPORTS
const express = require("express"),
  listEndpoints = require("express-list-endpoints"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  oAuth = require("./utilities/auth/oAuth");

//SERVICES IMPORTS
const mainRoute = require("./services");

//ERRORS HANDLING IMPORTS
const {
  notFound,
  unAuthorized,
  forbidden,
  badRequest,
  genericError,
} = require("./utilities/errorsHandling");

//MAIN
const server = express(),
  PORT = process.env.PORT || 5001,
  accessWhitelist =
    process.env.NODE_ENV === "production"
      ? [process.env.FE_URL_DEV, process.env.FE_URL_PROD]
      : [process.env.FE_URL_DEV],
  corsOptions = {
    origin: function (origin, callback) {
      accessWhitelist.indexOf(origin) !== -1 || !origin
        ? callback(null, true)
        : callback(new Error("Invalid origin"));
    },
    credentials: true,
  };

//MIDDLEWEARES
server.use(express.json());
server.use(cors());
server.use(passport.initialize());

//ROUTE
server.use("/strivify", mainRoute);

//ERRORS ROUTE
server.use(notFound);
server.use(unAuthorized);
server.use(forbidden);
server.use(badRequest);
server.use(genericError);

//CONSOLE LOGS
console.log(listEndpoints(server));

//MONGO CONNECTION
mongoose
  .connect(process.env.MONGODB_ONLINE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(PORT, () => {
      process.env.NODE_ENV === "production"
        ? console.log(`Server running on PORT : ${PORT}`)
        : console.log(`Server running on : http://localhost:${PORT}`);
    })
  )
  .catch((err) => console.log(err));
