const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");

// get all quizzes
router.post("/generateMessage", messageController.generateMessage);

module.exports = router;
