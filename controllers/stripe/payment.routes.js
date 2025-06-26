const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const webhookController = require("./webhook.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// Endpoint for app to create a payment intent
router.post(
  "/create-payment-intent",
  authMiddleware.isAuth,
  paymentController.createPaymentIntent
);

// Stripe Webhook endpoint (Stripe calls this, no app auth needed here, Stripe signs it)
router.post("/stripe", webhookController.handleStripeWebhook);

module.exports = router;
