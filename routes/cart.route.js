const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

router.get("/", cartController.getCart);

// router.get("/:id", cartController.getCartById);

router.post("/", cartController.addItem);

router.put("/items/:productId", cartController.updateItemQuantity);

router.delete("/items/:productId", cartController.removeItem);

router.delete("/", cartController.clearCart);

module.exports = router;
