const express = require("express");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const { json } = require("body-parser");

app.use(express.json());

app.use("/api/v1/places/", placesRoutes); //places api
app.use("/api/v1/users/", usersRoutes); //places api
// only if we didn't send the response
app.use((req, res, next) => {
  const error = new HttpError("couldnt find this route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "Something went wrong in the aapp",
    code: error.code,
  });
}); //if 4 params, special middleware - error handling. Express will only use it if ther ewas an error

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mvkrs.mongodb.net/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // possibly might be better to split this into couple of variables
  .then(() => {
    console.log("Connected to the database server");
    // can also run the db write check to see if the database name is not misspelled. TODO:
    app.listen(5000);
  })
  .catch(e => {
    console.log("Errors..");
    console.log(e.message);
    console.log(e.code);
  });
