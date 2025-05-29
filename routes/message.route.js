const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");

// get all messages
router.get("/", messageController.getMessages);

router.post("/", messageController.postMessage);

module.exports = router;
