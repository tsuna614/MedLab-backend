const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/getAllUserOrder",
  authMiddleware.isAuth,
  orderController.getAllUserOrder
);

router.get("/", orderController.getOrders);

router.post("/", authMiddleware.isAuth, orderController.createOrder);

router.put("/updateOrderStatus/:id", orderController.updateOrderStatus);

router.delete("/:id", orderController.deleteOrder);

// router.delete("/", orderController.clearOrder);

module.exports = router;
