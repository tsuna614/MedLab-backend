const Message = require("../models/message.model");
const { generateMessage } = require("../api/openai");
const mongoose = require("mongoose");

const messageController = {
  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;

      // Find the user's messages
      const messageDoc = await Message.findOne({ userId: userId }).sort({
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

      res.status(200).json({ response: aiResponse });
    } catch (err) {
      console.error("Error in postMessage:", err);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = messageController;
