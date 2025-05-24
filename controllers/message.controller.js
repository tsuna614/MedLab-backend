const Message = require("../models/message.model");
const { generateMessage } = require("../api/openai");
const mongoose = require("mongoose");

const messageController = {
  generateMessage: async (req, res) => {
    try {
      const userId = req.user.id;
      const response = await generateMessage(req.body.message);

      res.status(200).json({ message: response[0] });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = messageController;
