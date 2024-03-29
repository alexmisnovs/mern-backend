const fs = require("fs");
const path = require("path");
const express = require("express");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/v1/places/", placesRoutes); //places api
app.use("/api/v1/users/", usersRoutes); //places api

// only if we didn't send the response
app.use((req, res, next) => {
  const error = new HttpError("couldnt find this route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log("file deleted");
    });
  }
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "Something went wrong in the aapp",
    code: error.code,
  });
}); //if 4 params, special middleware - error handling. Express will only use it if ther ewas an error

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mvkrs.mongodb.net/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority&ssl=true`;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }) // possibly might be better to split this into couple of variables
  .then(() => {
    console.log("Connected to the database server");
    // can also run the db write check to see if the database name is not misspelled. TODO:
    app.listen(process.env.PORT || 4000);
  })
  .catch(e => {
    console.log("Errors..");
    console.log(e.message);
    console.log(e.code);
  });
