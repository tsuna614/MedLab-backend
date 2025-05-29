const Cart = require("../models/cart.model");
const mongoose = require("mongoose");

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;

      // const cart = await Cart.findOne({ userId: userId });
      const cart = await Cart.findOne({ userId: userId }).populate(
        "items.productId",
        "name price imageUrl stock prescriptionRequired"
      );

      if (!cart) {
        return res
          .status(404)
          .json({ message: "Cart not found for this user." });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  addItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({
          message: "Invalid input: productId and positive quantity required.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid Product ID format" });
      }

      let cart = await Cart.findOne({ userId: userId });

      if (!cart) {
        cart = new Cart({ userId: userId, items: [{ productId, quantity }] });
      } else {
        const itemIndex = cart.items.findIndex(
          (item) => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ productId, quantity });
        }
      }

      cart.populate(
        "items.productId",
        "name price imageUrl stock prescriptionRequired"
      );

      await cart.save();

      res.status(200).json(cart);
    } catch (error) {
      console.error("Error adding/updating item:", error);
      if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
        return res
          .status(409)
          .json({ message: "Conflict: Cart already exists (unexpected)." });
      }
      res.status(500).json({ message: "Error updating cart." });
    }
  },
  updateItemQuantity: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
      }
      if (!quantity || quantity < 1) {
        return res
          .status(400)
          .json({ message: "Invalid input: Positive quantity required." });
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid Product ID format" });
      }

      const updatedCart = await Cart.findOneAndUpdate(
        { userId: userId, "items.productId": productId },
        { $set: { "items.$.quantity": quantity } },
        { new: true }
      ).populate("items.productId", "name price imageUrl");

      if (!updatedCart) {
        const cartExists = await Cart.findOne({ userId: userId });
        if (!cartExists) {
          return res.status(404).json({ message: "Cart not found." });
        } else {
          return res.status(404).json({ message: "Item not found in cart." });
        }
      }

      res.status(200).json(updatedCart);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      res.status(500).json({ message: "Error updating item quantity." });
    }
  },

  removeItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid Product ID format" });
      }

      const updatedCart = await Cart.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      ).populate("items.productId", "name price imageUrl");

      if (!updatedCart) {
        return res
          .status(404)
          .json({ message: "Cart not found or item not in cart." });
      }

      res.status(200).json(updatedCart); // Return the updated cart
    } catch (error) {
      console.error("Error removing item:", error);
      res.status(500).json({ message: "Error removing item from cart." });
    }
  },

  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      console.log(`User ID: ${userId}`); // Debugging line to check userId
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
      }

      const updatedCart = await Cart.findOneAndUpdate(
        { userId: userId },
        { $set: { items: [] } },
        { new: true }
      );

      if (!updatedCart) {
        return res
          .status(200)
          .json({ message: "Cart is already empty or not found.", items: [] });
      }

      res
        .status(200)
        .json({ message: "Cart cleared successfully.", items: [] });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Error clearing cart." });
    }
  },
};

module.exports = cartController;
