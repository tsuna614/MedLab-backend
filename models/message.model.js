const mongoose = require("mongoose");

const messageItemSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const messageSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
      index: true,
    },
    messages: [messageItemSchema],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;
