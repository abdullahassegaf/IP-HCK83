// midtransController.js
const midtransClient = require("midtrans-client");
const { User, Transaction } = require("../models");

const snap = new midtransClient.Snap({
   isProduction: false,
   serverKey: process.env.MIDTRANS_SERVER_KEY,
});

async function createTransaction(req, res) {
   // Use logged-in user's info for transaction
   const user = req.user;
   const orderId = `order-${user.id}-${Date.now()}`;
   const parameter = {
      transaction_details: {
         order_id: orderId,
         gross_amount: 100000, // 100.000 for 5 tokens
      },
      customer_details: {
         first_name: user.username || "User",
         email: user.email,
      },
      // Pass userId in custom field for later reference
      custom_field1: String(user.id),
   };

   try {
      // Create a transaction record in DB (status: pending)
      await Transaction.create({
         token: orderId,
         paymentStatus: "pending",
         userId: user.id,
      });
      const transaction = await snap.createTransaction(parameter);
      res.json({ redirect_url: transaction.redirect_url });
   } catch (e) {
      res.status(500).json(e);
   }
}

// Midtrans notification handler
async function handleNotification(req, res) {
   try {
      const notification = req.body;
      const statusResponse = await snap.transaction.notification(notification);
      const { transaction_status, order_id } = statusResponse;
      // Extract userId from order_id or custom_field1
      let userId = null;
      if (statusResponse.custom_field1) {
         userId = parseInt(statusResponse.custom_field1);
      } else if (order_id && order_id.startsWith("order-")) {
         userId = parseInt(order_id.split("-")[1]);
      }
      // Update transaction status in DB
      if (order_id) {
         await Transaction.update(
            { paymentStatus: transaction_status },
            { where: { token: order_id } }
         );
      }
      if (
         userId &&
         (transaction_status === "settlement" ||
            transaction_status === "capture")
      ) {
         // Add 5 tokens to user
         await User.increment({ token: 5 }, { where: { id: userId } });
      }
      res.status(200).json({ message: "OK" });
   } catch (e) {
      res.status(500).json({ message: e.message });
   }
}

module.exports = { createTransaction, handleNotification };
