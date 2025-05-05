const Cart = require("../models/cart.model");
const mongoose = require("mongoose");

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;

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

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
      }
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({
          message: "Invalid input: productId and positive quantity required.",
        });
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid Product ID format" });
      }

      // Find the user's cart, or create it if it doesn't exist (upsert logic)
      let cart = await Cart.findOne({ userId: userId });

      if (!cart) {
        // Create a new cart if none exists
        cart = new Cart({ userId: userId, items: [{ productId, quantity }] });
      } else {
        // Cart exists, check if item is already in the cart
        const itemIndex = cart.items.findIndex(
          (item) => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
          // Item exists, update quantity (e.g., add to existing)
          cart.items[itemIndex].quantity += quantity;
        } else {
          // Item does not exist, add new item to the array
          cart.items.push({ productId, quantity });
        }
      }

      cart.populate(
        "items.productId",
        "name price imageUrl stock prescriptionRequired"
      );

      await cart.save();

      res.status(200).json(cart); // Return the updated cart
    } catch (error) {
      console.error("Error adding/updating item:", error);
      // Handle potential duplicate key error if unique constraint fails unexpectedly
      if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
        return res
          .status(409)
          .json({ message: "Conflict: Cart already exists (unexpected)." });
      }
      res.status(500).json({ message: "Error updating cart." });
    }
  },
  // PUT /api/cart/items/{productId} - Set specific quantity for an item
  updateItemQuantity: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params; // Get productId from URL parameters
      const { quantity } = req.body; // Get new quantity from request body

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

      // Find the cart and update the specific item's quantity
      // Use findOneAndUpdate for atomicity if possible for simple updates
      const updatedCart = await Cart.findOneAndUpdate(
        { userId: userId, "items.productId": productId }, // Find cart and specific item
        { $set: { "items.$.quantity": quantity } }, // Update quantity of matched item
        { new: true } // Return the modified document
      ).populate("items.productId", "name price imageUrl");

      if (!updatedCart) {
        // This could mean the cart doesn't exist OR the item wasn't in the cart
        // Check if cart exists at all
        const cartExists = await Cart.findOne({ userId: userId });
        if (!cartExists) {
          return res.status(404).json({ message: "Cart not found." });
        } else {
          return res.status(404).json({ message: "Item not found in cart." });
        }
      }

      res.status(200).json(updatedCart); // Return the updated cart
    } catch (error) {
      console.error("Error updating item quantity:", error);
      res.status(500).json({ message: "Error updating item quantity." });
    }
  },

  // DELETE /api/cart/items/{productId} - Remove an item from the cart
  removeItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params; // Get productId from URL

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid Product ID format" });
      }

      // Find the cart and pull the item from the items array
      const updatedCart = await Cart.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } }, // Remove item matching productId
        { new: true } // Return the modified document
      ).populate("items.productId", "name price imageUrl");

      if (!updatedCart) {
        // Cart might not exist, or item was already not there
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

  // DELETE /api/cart - Clear all items from the user's cart
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      console.log(`User ID: ${userId}`); // Debugging line to check userId
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
      }

      // Find the user's cart and set items to an empty array
      // Alternatively, delete the document: await Cart.findOneAndDelete({ userId: userId });
      const updatedCart = await Cart.findOneAndUpdate(
        { userId: userId },
        { $set: { items: [] } }, // Set items array to empty
        { new: true } // Return the modified document
      );

      if (!updatedCart) {
        // If no cart existed, that's fine, it's already clear.
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
