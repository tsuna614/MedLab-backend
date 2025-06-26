// webhookController.js
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_TEST_SECRET_KEY);
const Order = require("../../models/order.model"); // Your Mongoose Order model

const webhookController = {
  handleStripeWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody || req.body,
        sig,
        endpointSecret
      ); // req.rawBody if using middleware like bodyParser.raw
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Received Stripe Webhook Event:", event.type);

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntentSucceeded.id);
        // Fulfill the purchase (e.g., update your database)
        try {
          const orderId = paymentIntentSucceeded.metadata.order_id;
          if (orderId) {
            const order = await Order.findById(orderId);
            if (order && order.status !== "Paid") {
              // Check to prevent reprocessing
              order.status = "Paid"; // Or 'Processing', 'Completed'
              order.paymentDetails = `Stripe PI: ${paymentIntentSucceeded.id}`;
              // order.stripePaymentIntent = paymentIntentSucceeded; // Store more details if needed
              await order.save();
              console.log(`Order ${orderId} updated to Paid.`);
              // TODO: Send confirmation email, notify fulfillment, etc.
            } else if (order && order.status === "Paid") {
              console.log(`Order ${orderId} was already marked as Paid.`);
            } else {
              console.error(
                `Webhook: Order ${orderId} not found for successful paymentIntent ${paymentIntentSucceeded.id}`
              );
            }
          } else {
            console.error(
              `Webhook: Missing order_id in metadata for paymentIntent ${paymentIntentSucceeded.id}`
            );
          }
        } catch (dbError) {
          console.error("Webhook: Database error updating order:", dbError);
          // You might need to handle this error more gracefully, e.g., by queuing for retry
          return res.status(500).send("Webhook DB Error");
        }
        break;
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object;
        console.log(
          "PaymentIntent failed:",
          paymentIntentFailed.id,
          paymentIntentFailed.last_payment_error?.message
        );
        // Notify the customer that their payment failed
        // Optionally update order status to 'PaymentFailed'
        const orderIdFailed = paymentIntentFailed.metadata.order_id;
        if (orderIdFailed) {
          await Order.updateOne(
            { _id: orderIdFailed },
            {
              status: "PaymentFailed",
              paymentDetails: `Stripe PI Failed: ${paymentIntentFailed.id}`,
            }
          );
          console.log(
            `Order ${orderIdFailed} status updated to PaymentFailed.`
          );
        }
        break;
      // ... handle other event types as needed (e.g., 'charge.refunded')
      default:
        console.log(`Unhandled Stripe event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send();
  },
};
module.exports = webhookController;
