const mongoose = require("mongoose");

const cartItemSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true, // *** CRITICAL: Ensures only one cart per user ***
      index: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware to update the `updatedAt` field on save
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to update the `updatedAt` field on findOneAndUpdate
cartSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Cart = mongoose.model("carts", cartSchema);

module.exports = Cart;
