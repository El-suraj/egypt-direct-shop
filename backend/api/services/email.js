import logger from "../utils/logger.js";

// Simple email service using Resend (if available) or console logging
// In production, replace with actual Resend API or your preferred email service

const sendEmail = async (email, subject, htmlContent) => {
  try {
    // If Resend API key is available, use it
    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "orders@egypt-direct-shop.com",
          to: email,
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`Email sent successfully to ${email} - ID: ${data.id}`);
      return data;
    } else {
      // Fallback: log to console (for development)
      logger.info(`[EMAIL] To: ${email}`);
      logger.info(`[EMAIL] Subject: ${subject}`);
      logger.info(`[EMAIL] Body: ${htmlContent.substring(0, 100)}...`);
      return { id: "dev-mode" };
    }
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

const sendOrderConfirmation = async (order, userEmail) => {
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = order.items
    ?.map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">₦${(item.price_ngn * item.quantity).toLocaleString()}</td>
    </tr>
  `,
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .order-details { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .order-details p { margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
          .total-row { font-weight: bold; font-size: 16px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #333; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! ✓</h1>
            <p>Thank you for your purchase from Egypt Direct Shop</p>
          </div>

          <div class="order-details">
            <p><strong>Order ID:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Delivery Address:</strong></p>
            <p>
              ${order.shipping_address?.fullName}<br>
              ${order.shipping_address?.street}<br>
              ${order.shipping_address?.city}, ${order.shipping_address?.state}
            </p>
          </div>

          <h2 style="font-size: 18px; margin-bottom: 12px;">Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2" style="padding: 12px; border-top: 2px solid #e0e0e0;">Total Amount:</td>
                <td style="padding: 12px; border-top: 2px solid #e0e0e0; text-align: right;">₦${order.total_ngn.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top: 20px; color: #666;">
            <strong>Estimated Delivery:</strong> 5-10 business days from Egypt
          </p>

          <a href="https://egypt-direct-shop.com/order/${order.id}" class="button">Track Order</a>

          <div class="footer">
            <p>© 2026 Egypt Direct Shop. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(
    userEmail,
    "Order Confirmation - Egypt Direct Shop",
    htmlContent,
  );
};

const sendOrderShipped = async (order, userEmail) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50; }
          .header h1 { margin: 0; font-size: 24px; color: #2e7d32; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order is On The Way! 🚚</h1>
            <p>Order #${order.id.slice(0, 8).toUpperCase()} has shipped</p>
          </div>

          <p>Your clothing order is now in transit to ${order.shipping_address?.city}.</p>
          <p><strong>Estimated Delivery:</strong> 5-10 business days</p>
          <p>You can track your order status anytime on our website.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://egypt-direct-shop.com/order/${order.id}" style="display: inline-block; background: #333; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              Track Package
            </a>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            © 2026 Egypt Direct Shop
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail(
    userEmail,
    "Your Order is Shipped - Egypt Direct Shop",
    htmlContent,
  );
};

const sendOrderDelivered = async (order, userEmail) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Delivered</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c8e6c9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2e7d32; }
          .header h1 { margin: 0; font-size: 24px; color: #1b5e20; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Delivery Confirmed! 📦</h1>
            <p>Your order #${order.id.slice(0, 8).toUpperCase()} has been delivered</p>
          </div>

          <p>Your clothing order has been successfully delivered to:</p>
          <p>
            <strong>${order.shipping_address?.fullName}</strong><br>
            ${order.shipping_address?.street}<br>
            ${order.shipping_address?.city}, ${order.shipping_address?.state}
          </p>

          <p style="margin-top: 20px;">Thank you for shopping with Egypt Direct Shop! We hope you love your new clothing.</p>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            © 2026 Egypt Direct Shop
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail(
    userEmail,
    "Order Delivered - Egypt Direct Shop",
    htmlContent,
  );
};

export {
  sendEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
};
