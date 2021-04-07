const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Bearer Token
    if (!token) {
      return next(new HttpError("Auth failed", 401));
    }
  } catch (error) {
    return next(new HttpError(`Auth failed, ${error.message}`, 500));
  }
};
