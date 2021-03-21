const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const placesRoutes = require("./routes/places-routes");
const { json } = require("body-parser");

app.use(express.json());

app.use("/api/places/v1/", placesRoutes); //places api

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Something went wrong in the aapp" });
}); //if 4 params, special middleware - error handling. Express will only use it if ther ewas an error
app.listen(5000);
