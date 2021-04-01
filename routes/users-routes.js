const express = require("express");
const { check, body } = require("express-validator");

const router = express.Router();
const usersController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");
// will respond to antyhing after the slash, so its better to use something like: /places/pid
router.get("/", usersController.getAllUsers);
router.get("/:uid", usersController.getUserById);
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail().withMessage("must be a valid email"),
    check("password").isLength({ min: 5 }).withMessage("must contain atleast 5 chars"),
  ],
  usersController.signup
);
router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 5 }).withMessage("must contain atleast 5 chars"),
  ],
  usersController.login
);
router.patch(
  "/:uid",
  [
    check("name").if(body("name").exists()).not().isEmpty(),
    check("email").if(body("email").exists()).isEmail(),
    check("password")
      .if(body("password").exists())
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .withMessage("must contain atleast 5 chars"),
  ],
  usersController.updateUserById
);
router.delete("/:uid", usersController.deleteUserById);

module.exports = router;
