const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.get("/", orderController.getAllOrders);

// router.get("/:id", orderController.getOrderById);

router.post("/", orderController.createOrder);

// router.put("/items/:productId", orderController.updateItemQuantity);

// router.delete("/items/:productId", orderController.removeItem);

// router.delete("/", orderController.clearOrder);

module.exports = router;
