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

// router.post(
//   "/sendMessage",
//   authMiddleware.isAuth,
//   messageController.postMessage
// );
// router.post("/sendMessage/:id", messageController.adminPostMessage);

/* postMessage: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = req.user.id;
      const userMessage = req.body.message;

      // pre conditions check
      if (!userId) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(401)
          .json({ message: "You are not authorized to post message." });
      }
      if (
        !userMessage ||
        typeof userMessage !== "string" ||
        userMessage.trim() === ""
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Message cannot be empty." });
      }

      // Check if the user already has a message document
      let messageDoc = await Message.findOne({ userId: userId }).session(
        session
      );

      const userMessageObj = { message: userMessage, senderType: "user" };

      if (!messageDoc) {
        // If not, create a new message document
        messageDoc = new Message({
          userId: userId,
          messages: [userMessageObj],
        });
      } else {
        // If it exists, push new messages to the existing document
        messageDoc.messages.push(userMessageObj);
      }

      await messageDoc.save({ session: session });
      console.log(`Messages saved for user ${userId}.`);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: "Message sent successfully." });
    } catch (err) {
      console.error("Error in postMessage:", err);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: err.message });
    }
  },
  adminPostMessage: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = req.params.id;
      const adminMessage = req.body.message;

      // pre conditions check
      if (!userId) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(401)
          .json({ message: "You are not authorized to post message." });
      }
      if (
        !adminMessage ||
        typeof adminMessage !== "string" ||
        adminMessage.trim() === ""
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Message cannot be empty." });
      }

      // Check if the user already has a message document
      let messageDoc = await Message.findOne({ userId: userId }).session(
        session
      );

      const adminMessageObj = { message: adminMessage, senderType: "admin" };

      if (!messageDoc) {
        // If not, create a new message document
        messageDoc = new Message({
          userId: userId,
          adminMessage: [adminMessageObj],
        });
      } else {
        // If it exists, push new messages to the existing document
        messageDoc.adminMessage.push(adminMessageObj);
      }

      await messageDoc.save({ session: session });
      console.log(`Admin message saved for user ${userId}.`);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: "Admin message sent successfully." });
    } catch (err) {
      console.error("Error in adminPostMessage:", err);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: err.message });
    }
  }, */

module.exports = router;
