const mongoose = require("mongoose");

const messageItemSchema = mongoose.Schema(
  {
    message: {
      type: String,
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

// Middleware to update the `updatedAt` field on save
messageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to update the `updatedAt` field on findOneAndUpdate
messageSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;
