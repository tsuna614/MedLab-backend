const { Message } = require("../models/message.model");
const { generateMessage } = require("../api/openai");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const productController = require("./product.controller");

function normalizeText(text) {
  return text
    .replace(/[\u202F\u00A0\u2000-\u200B]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const messageController = {
  fetchAIMessages: async (req, res) => {
    try {
      const userId = req.user.id;

      // Find the user's messages
      const messageDoc = await Message.findOne({ userId: userId });
      // .select("-adminMessage") // Exclude admin messages
      // .sort({
      //   "messages.createdAt": -1, // this sorts the messages by timestamps
      // });

      if (!messageDoc) {
        return res
          .status(404)
          .json({ message: "No messages found for this user." });
      }

      res.status(200).json(messageDoc);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  fetchMessages: async (req, res) => {
    try {
      const userId = req.params.id || req.user.id;

      console.log("Fetching messages for user ID:", userId);

      const messageDoc = await Message.findOne({ userId: userId })
        .select("-messages") // Exclude admin messages
        .sort({
          "adminMessage.createdAt": -1, // this sorts the messages by timestamps
        });

      if (!messageDoc || messageDoc.adminMessage.length === 0) {
        return res
          .status(404)
          .json({ message: "No messages found for this user." });
      }

      res.status(200).json(messageDoc);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  generateAIMessage: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Received message from user:", req.body);

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

      let aiResponse;

      const productNames = await productController.getProductForAIBot();

      try {
        const openAIResponse = await generateMessage(userMessage, productNames);
        if (
          Array.isArray(openAIResponse) &&
          openAIResponse.length > 0 &&
          typeof openAIResponse[0] === "string"
        ) {
          aiResponse = openAIResponse[0];
        } else if (typeof openAIResponse === "string") {
          aiResponse = openAIResponse;
        } else {
          console.error("Unexpected OpenAI response format:", openAIResponse);
          throw new Error("Failed to get a valid response from AI service.");
        }
      } catch (openaiError) {}

      const suggestedProducts = productNames.filter((name) =>
        normalizeText(aiResponse).includes(normalizeText(name))
      );

      console.log("Suggested products:", suggestedProducts);

      // Check if the user already has a message document
      let messageDoc = await Message.findOne({ userId: userId }).session(
        session
      );

      const userMessageObj = { message: userMessage, senderType: "user" };
      const aiMessageObj = {
        message: aiResponse,
        senderType: "ai",
        productSuggestion: suggestedProducts,
      };

      if (!messageDoc) {
        // If not, create a new message document
        messageDoc = new Message({
          userId: userId,
          messages: [userMessageObj, aiMessageObj],
        });
      } else {
        // If it exists, push new messages to the existing document
        messageDoc.messages.push(userMessageObj, aiMessageObj);
      }

      await messageDoc.save({ session: session });
      console.log(`Messages saved for user ${userId}.`);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: aiResponse,
        productSuggestion: suggestedProducts || null,
      });
    } catch (err) {
      console.error("Error in generateAIMessage:", err);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: err.message });
    }
  },
  postMessage: async (newMessage) => {
    const { message, senderType, userId } = newMessage;

    const session = await mongoose.startSession();

    session.startTransaction();

    console.log("Posting message:", newMessage);

    try {
      // pre conditions check
      if (!userId) {
        await session.abortTransaction();
        session.endSession();
        return {
          status: 401,
          message: "You are not authorized to post message.",
        };
      }
      if (!message || typeof message !== "string" || message.trim() === "") {
        await session.abortTransaction();
        session.endSession();
        return { status: 400, message: "Message cannot be empty." };
      }

      // Check if the user already has a message document
      let messageDoc = await Message.findOne({ userId: userId }).session(
        session
      );

      const userMessageObj = {
        message,
        senderType,
        isRead: senderType === "admin", // mark as read if admin sends, else unread
      };

      if (!messageDoc) {
        let user = await User.findById(userId).session(session);
        if (!user) {
          await session.abortTransaction();
          session.endSession();
          return { status: 404, message: "User not found." };
        }
        // If not, create a new message document
        messageDoc = new Message({
          userId,
          adminMessage: [userMessageObj],
        });
      } else {
        // If it exists, push new messages to the existing document
        messageDoc.adminMessage.push(userMessageObj);
      }

      await messageDoc.save({ session });
      console.log(`Messages saved for user ${userId}.`);

      await session.commitTransaction();
      session.endSession();

      return { status: 200, message: "Message sent successfully." };
    } catch (err) {
      console.error("Error in postMessage:", err);
      await session.abortTransaction();
      session.endSession();
      return { status: 500, message: err.message };
    }
  },
};

module.exports = messageController;
