const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucher.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/withPagination", voucherController.getVoucherWithPagination);
router.get("/:id", voucherController.getVoucherById);
router.get("/", voucherController.getAllVouchers);

router.post("/", voucherController.createVoucher);
router.post(
  "/redeemVoucher",
  authMiddleware.isAuth,
  voucherController.redeemVoucher
);

router.put("/:id", voucherController.updateVoucher);

router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
