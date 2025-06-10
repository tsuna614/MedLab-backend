const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const mongoose = require("mongoose");

const orderController = {
  getOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const status = req.query.status;

      const filter = {};
      if (status) {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email");

      const total = await Order.countDocuments(filter);

      res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        orders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders", error });
    }
  },
  getAllUserOrder: async (req, res) => {
    try {
      const userId = req.user.id;

      console.log(`User ID: ${userId}`);

      const orders = await Order.find({ userId: userId });

      if (!orders) {
        return res.status(404).json({ message: "No orders found." });
      }

      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  },
  createOrder: async (req, res) => {
    console.log("====================================");
    console.log(req.body);
    console.log("====================================");

    // use session because if any step fail, rollback all changes
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Extract Data & Validate Input
      const { items, shippingAddress /* , paymentMethodId (etc.) */ } =
        req.body;
      const userId = req.user.id; // Get user ID from authenticated request

      if (!userId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(401).json({ message: "User not authenticated." });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Order must contain items." });
      }
      if (!shippingAddress /* || !paymentMethodId */) {
        // Add validation for other required fields
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Missing required order information (e.g., address).",
        });
      }

      // Validate item structure (basic example)
      for (const item of items) {
        if (
          !item.productId ||
          typeof item.quantity !== "number" ||
          item.quantity < 1
        ) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Invalid item data for productId ${
              item.productId || "unknown"
            }.`,
          });
        }
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: `Invalid Product ID format: ${item.productId}` });
        }
      }

      const productIds = items.map((item) => item.productId);

      console.log(productIds);

      // 2. Fetch Products & Check Stock within the transaction
      //    Use 'session' option to include these reads in the transaction
      const productsInDb = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      // Check if all requested product IDs were found
      if (productsInDb.length !== productIds.length) {
        const foundIds = new Set(productsInDb.map((p) => p._id.toString()));
        const notFoundIds = productIds.filter((id) => !foundIds.has(id));
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Products not found: ${notFoundIds.join(", ")}` });
      }

      let calculatedTotalAmount = 0;
      const orderItemsDetails = [];
      const stockUpdates = [];
      const insufficientStockItems = [];

      for (const item of items) {
        const product = productsInDb.find(
          (p) => p._id.toString() === item.productId.toString()
        );
        // We know the product exists because of the check above

        // Check stock level
        if (!product || product.stock < item.quantity) {
          insufficientStockItems.push({
            productId: product._id,
            name: product.name,
            requested: item.quantity,
            available: product?.stock ?? 0, // Handle case where product might be null (though unlikely after check)
          });
        } else {
          // Stock is sufficient for this item
          const priceSnapshot = product.price; // Use current price from DB
          calculatedTotalAmount += priceSnapshot * item.quantity;
          orderItemsDetails.push({
            productId: product._id,
            quantity: item.quantity,
            priceSnapshot: priceSnapshot,
            productNameSnapshot: product.name, // Store name snapshot
            imageUrlSnapshot: product.imageUrl, // Store image URL snapshot

            // Add other snapshots like imageUrl if needed
          });

          // Prepare stock update operation for later execution
          stockUpdates.push({
            updateOne: {
              filter: { _id: product._id, stock: { $gte: item.quantity } }, // Ensure stock hasn't changed concurrently
              update: { $inc: { stock: -item.quantity } }, // Decrement stock atomically
            },
          });
        }
      }

      // 3. Handle Insufficient Stock
      if (insufficientStockItems.length > 0) {
        await session.abortTransaction(); // Rollback any potential changes
        session.endSession();
        return res.status(400).json({
          message: "Insufficient stock for some items.",
          details: insufficientStockItems, // Send details about problematic items
        });
      }

      // 4. Decrement Stock Atomically (using bulkWrite)
      if (stockUpdates.length > 0) {
        const stockUpdateResult = await Product.bulkWrite(stockUpdates, {
          session: session,
        });
        // Check if the number of modified documents matches the number of updates
        // This helps detect if stock changed between the read and the write (race condition)
        if (stockUpdateResult.modifiedCount !== stockUpdates.length) {
          console.warn(
            "Stock update mismatch - potential race condition detected."
          );
          await session.abortTransaction();
          session.endSession();
          // Ask user to retry or re-verify cart
          return res.status(409).json({
            message:
              "Stock levels changed while placing order. Please review your cart and try again.",
          });
        }
        console.log(
          `Stock updated for ${stockUpdateResult.modifiedCount} products.`
        );
      }

      // 5. Create and Save the Order
      // Add calculated total, tax, shipping (calculate these properly)
      const shippingCost = 5.0; // Example - Calculate properly
      const taxAmount = calculatedTotalAmount * 0.08; // Example 8% - Calculate properly
      const finalTotal = calculatedTotalAmount + shippingCost + taxAmount;

      const newOrder = new Order({
        userId: userId,
        orderNumber: `ORD-${Date.now()}`, // Generate a more robust order number
        items: orderItemsDetails,
        shippingAddress: shippingAddress,
        totalAmount: finalTotal, // Use backend calculated total
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        status: "Pending", // Initial status
        paymentMethodDetails: "placeholder", // Add payment details safely
      });

      const savedOrder = await newOrder.save({ session: session });

      // 6. Clear the User's Cart
      // Use findOneAndDelete or update to empty the items array
      await Cart.findOneAndDelete({ userId: userId }).session(session);
      // OR: await Cart.findOneAndUpdate({ userId: userId }, { $set: { items: [] } }).session(session);
      console.log(`Cart cleared for user ${userId}`);

      // 7. Commit Transaction & Respond
      await session.commitTransaction(); // Finalize all changes
      session.endSession(); // Close the session
      res
        .status(201)
        .json({ message: "Order created successfully", order: savedOrder });
    } catch (error) {
      console.error("Error creating order:", error);
      // Abort transaction in case of any error during the process
      await session.abortTransaction();
      session.endSession();
      res
        .status(500)
        .json({ message: "Failed to create order.", error: error.message }); // Send back only error message
    }
  },
  // createOrder: async (req, res) => {
  //   try {
  //     const orderData = req.body;

  //     const order = new Order(orderData);

  //     const orderedProducts = orderData.items.map((item) => ({
  //       productId: item.productId,
  //       quantity: item.quantity,
  //     }));

  //     const stockedProducts = await Product.find({
  //       _id: { $in: orderedProducts.map((item) => item.productId) },
  //     });

  //     const insufficientStock = stockedProducts.filter((product) => {
  //       const orderedItem = orderedProducts.find(
  //         (item) => item.productId.toString() === product._id.toString()
  //       );
  //       return product.stock < orderedItem.quantity;
  //     });

  //     if (insufficientStock.length > 0) {
  //       return res.status(400).json({
  //         message: "Insufficient stock for the following products",
  //         insufficientStock,
  //       });
  //     }

  //     await order.save();
  //     res.status(201).json({ message: "Order created successfully", order });
  //   } catch (error) {
  //     res.status(500).json({ message: "Error creating order", error });
  //   }
  // },
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order", error });
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (
        [
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Refunded",
        ].indexOf(status) === -1
      ) {
        return res.status(400).json({ message: "Invalid status provided" });
      }
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json({ message: "Order updated successfully", order });
    } catch (error) {
      res.status(500).json({ message: "Error updating order", error });
    }
  },
  deleteOrder: async (req, res) => {
    try {
      const id = req.params.id;
      console.log("====================================");
      console.log(`Deleting order with ID: ${id}`);
      console.log("====================================");
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting order", error });
    }
  },
};

module.exports = orderController;
