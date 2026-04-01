import express from "express";
import axios from "axios";
import crypto from "crypto";
import logger from "../../utils/logger.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// POST /api/payments/initialize - Initialize Paystack payment
router.post("/initialize", authMiddleware, async (req, res) => {
  try {
    const { email, amount, orderId, metadata } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create Paystack transaction request
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        metadata: {
          userId,
          orderId,
          ...metadata,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data.status) {
      logger.error(`Paystack initialization failed: ${response.data.message}`);
      return res.status(400).json({
        error: response.data.message || "Payment initialization failed",
      });
    }

    res.json({
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (err) {
    logger.error(`Payment initialization error: ${err.message}`);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

// POST /api/payments/webhook - Paystack webhook handler
router.post("/webhook", async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      logger.warn("Invalid Paystack webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const { orderId, userId } = metadata;

      // Update order status
      const { error: updateError } = await req.supabase
        .from("orders")
        .update({
          status: "paid",
          payment_reference: reference,
          payment_method: "paystack",
        })
        .eq("id", orderId)
        .eq("user_id", userId);

      if (updateError) {
        logger.error(`Failed to update order status: ${updateError.message}`);
        return res.status(500).json({ error: "Failed to update order" });
      }

      logger.info(
        `Order ${orderId} payment confirmed - Reference: ${reference}`,
      );

      // TODO: Send confirmation email here
    }

    res.json({ success: true });
  } catch (err) {
    logger.error(`Webhook handler error: ${err.message}`);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// GET /api/payments/verify/:reference - Verify payment status
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    // Verify transaction with Paystack
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    if (!response.data.status || response.data.data.status !== "success") {
      logger.warn(`Payment verification failed for reference: ${reference}`);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const paymentData = response.data.data;
    const { orderId, userId } = paymentData.metadata || {};

    if (!orderId || !userId) {
      logger.warn(`Missing metadata for reference: ${reference}`);
      return res.status(400).json({
        success: false,
        message: "Invalid payment metadata",
      });
    }

    // Update order in database
    const { data: updatedOrder, error: updateError } = await req.supabase
      .from("orders")
      .update({
        status: "confirmed",
        payment_reference: reference,
        payment_method: "paystack",
        payment_status: "completed",
      })
      .eq("id", orderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      logger.error(`Failed to update order: ${updateError.message}`);
      return res.status(500).json({
        success: false,
        message: "Failed to update order",
      });
    }

    logger.info(`Payment verified for order ${orderId}`);

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (err) {
    logger.error(`Payment verification error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
});

export default router;
