// paymentController.js
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_TEST_SECRET_KEY);
const Order = require("../../models/order.model"); // Assuming you have an Order model

const paymentController = {
  createPaymentIntent: async (req, res) => {
    try {
      const { amount, currency = "usd", orderId, customerEmail } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      let customer;
      if (customerEmail) {
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          customer = await stripe.customers.create({ email: customerEmail });
        }
      }

      const paymentIntentParams = {
        amount: Math.round(amount * 100),
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Payment for Order ID: ${orderId}`,
        metadata: {
          order_id: orderId,
        },
      };
      if (customer) {
        paymentIntentParams.customer = customer.id;
      }

      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentParams
      );

      console.log("Created PaymentIntent:", paymentIntent.id);

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY,
      });
    } catch (error) {
      console.error("Error creating PaymentIntent:", error);
      res.status(500).json({ error: error.message });
    }
  },
  // ... more payment related controller functions
};

module.exports = paymentController;
