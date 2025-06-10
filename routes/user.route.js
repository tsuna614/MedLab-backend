const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/getAllUsers", userController.getAllUsers);

router.get("/", authMiddleware.isAuth, userController.getUser);

router.post("/", userController.createUser);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

// router.put("/:id", userController.updateUser);

// router.delete("/:id", userController.deleteUser);

module.exports = router;
