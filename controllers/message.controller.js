const Message = require("../models/message.model");
const { generateMessage } = require("../api/openai");
const mongoose = require("mongoose");

const messageController = {
  fetchAIMessages: async (req, res) => {
    try {
      const userId = req.user.id;

      // Find the user's messages
      const messageDoc = await Message.findOne({ userId: userId })
        .select("-adminMessage") // Exclude admin messages
        .sort({
          "messages.createdAt": -1, // this sorts the messages by timestamps
        });

      if (!messageDoc || messageDoc.messages.length === 0) {
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

      try {
        const openAIResponse = await generateMessage(userMessage);
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

      // Check if the user already has a message document
      let messageDoc = await Message.findOne({ userId: userId }).session(
        session
      );

      const userMessageObj = { message: userMessage, senderType: "user" };
      const aiMessageObj = { message: aiResponse, senderType: "ai" };

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

      res.status(200).json({ message: aiResponse });
    } catch (err) {
      console.error("Error in generateAIMessage:", err);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: err.message });
    }
  },
  postMessage: async (req, res) => {
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
  },
};

module.exports = messageController;
