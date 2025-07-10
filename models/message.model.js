const mongoose = require("mongoose");

const messageItemSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "ai", "admin"],
      required: true,
    },
    isRead: {
      type: Boolean, // only for "user" senderType, indicates if the admin has read the message
      default: false,
    },
    productSuggestion: {
      type: [String],
      required: false, // this is for AI suggestions
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
    adminMessage: [messageItemSchema], // this is the messages between admin and user
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Message = mongoose.model("messages", messageSchema);

module.exports = { Message, messageItemSchema };
