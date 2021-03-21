const express = require("express");

const router = express.Router();
const placesController = require("../controllers/places-controller");
// will respond to antyhing after the slash, so its better to use something like: /places/pid
router.get("/place/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/", placesController.createNewPlace);

module.exports = router;
