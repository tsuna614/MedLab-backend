const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh", authController.refreshToken);

// router.get("/getUserByEmail/:email", userController.getUserByEmail);

module.exports = router;
