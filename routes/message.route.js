const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middleware/auth.middleware");

// get all messages
router.get(
  "/fetchAIMessages",
  authMiddleware.isAuth,
  messageController.fetchAIMessages
);
router.get(
  "/fetchMessages",
  authMiddleware.isAuth,
  messageController.fetchMessages
);
router.get("/fetchMessages/:id", messageController.fetchMessages);

router.post(
  "/generateAIMessage",
  authMiddleware.isAuth,
  messageController.generateAIMessage
);

module.exports = router;
