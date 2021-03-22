const express = require("express");

const router = express.Router();
const usersController = require("../controllers/users-controller");
// will respond to antyhing after the slash, so its better to use something like: /places/pid
router.get("/", usersController.getAllUsers);
router.post("/signup", usersController.signup);
router.post("/login", usersController.login);
router.patch("/:uid", usersController.updateUserById);
router.delete("/:uid", usersController.deleteUserById);

module.exports = router;
