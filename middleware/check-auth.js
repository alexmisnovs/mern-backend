const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Bearer Token
    if (!token) {
      return next(new HttpError("Auth failed, something is wrong with token", 401));
    }
    const decodedToken = jwt.verify(token, process.env.JWTPRIVATEKEY);
    // add user data to the request to be used by the application later
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError(`Auth failed check-auth middleware. Error: ${error.message}`, 500));
  }
};
