const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const placesController = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload-places");
const checkAuth = require("../middleware/check-auth");
// will respond to antyhing after the slash, so its better to use something like: /places/pid
router.get("/:pid", placesController.getPlaceById);
router.get("/search/:city", placesController.findPlacesByCity);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty().withMessage("Please provide a value"),
    check("description").isLength({ min: 5 }).withMessage("must contain atleast 5 chars"),
    check("address").not().isEmpty().withMessage("Please provide a value"),
    check("city").not().isEmpty().withMessage("Please provide a value for city"),
  ],
  placesController.createNewPlace
);
router.patch(
  "/:pid",
  [
    check("title").if(body("title").exists()).not().isEmpty().withMessage("Please provide a value"),
    check("description")
      .if(body("description").exists())
      .isLength({ min: 5 })
      .withMessage("must contain atleast 5 chars"),
    check("address")
      .if(body("address").exists())
      .not()
      .isEmpty()
      .withMessage("Please provide a value"),
    check("city")
      .if(body("city").exists())
      .not()
      .isEmpty()
      .withMessage("Please provide a value for city"),
  ],
  placesController.updatePlaceById
);

router.delete("/:pid", placesController.deletePlaceById);
module.exports = router;
