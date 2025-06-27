const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
    },
    brand: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    dosageForm: {
      type: String,
      required: false,
    },
    strength: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    ingredients: {
      type: [String],
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    manufacturer: {
      type: String,
      required: false,
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model("products", productSchema);

module.exports = Product;
