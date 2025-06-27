const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/", productController.getAllProducts);

router.get("/getProductByLabel", productController.getProductByLabel);

router.get("/:id", productController.getProductById);

router.post("/", productController.createProduct);

router.put("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;
