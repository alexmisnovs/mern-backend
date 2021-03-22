const express = require("express");

const router = express.Router();
const placesController = require("../controllers/places-controller");
// will respond to antyhing after the slash, so its better to use something like: /places/pid
router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/", placesController.createNewPlace);
router.patch("/:pid", placesController.updatePlaceById);
router.delete("/:pid", placesController.deletePlaceById);
module.exports = router;
