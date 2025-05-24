const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/getAllUsers", userController.getAllUsers);

router.get("/", userController.getUserById);

router.post("/", userController.createUser);

router.put("/", userController.updateUser);

router.delete("/", userController.deleteUser);

// router.put("/:id", userController.updateUser);

// router.delete("/:id", userController.deleteUser);

module.exports = router;
