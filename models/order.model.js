const mongoose = require("mongoose");

const shippingAddressSchema = mongoose.Schema({
  recipientName: {
    type: String,
    required: false,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
});

const orderItemSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    productNameSnapshot: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    priceSnapshot: {
      type: Number,
      required: true,
    },
    imageUrlSnapshot: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    timestamps: true,
    versionKey: false,
  }
);

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
    },
    shippingAddress: shippingAddressSchema,
    paymentMethodDetails: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.pre("save", function (next) {
  this.orderDate = Date.now();
  next();
});

// orderSchema.pre("findOneAndUpdate", function (next) {
//   this.set({ orderDate: Date.now() });
//   next();
// });

// // Middleware to update the `updatedAt` field on save
// orderSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });

// // Middleware to update the `updatedAt` field on findOneAndUpdate
// orderSchema.pre('findOneAndUpdate', function(next) {
//     this.set({ updatedAt: Date.now() });
//     next();
// });

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
