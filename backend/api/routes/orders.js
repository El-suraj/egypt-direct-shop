import express from "express";
import logger from "../../utils/logger.js";

const router = express.Router();

// GET /api/orders - Get user's orders
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = req.supabase
      .from("orders")
      .select("id, status, total_ngn, created_at, shipping_address", {
        count: "exact",
      })
      .eq("user_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      logger.error(`Orders query error: ${error.message}`);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    res.json({
      orders: orders || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
      },
    });
  } catch (err) {
    logger.error(`Orders route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/orders/:id - Get single order with items
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: order, error } = await req.supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Order not found" });
      }
      logger.error(`Order detail error: ${error.message}`);
      return res.status(500).json({ error: "Failed to fetch order" });
    }

    // Get order items
    const { data: items, error: itemsError } = await req.supabase
      .from("order_items")
      .select(
        "id, product_id, product_name, quantity, price_ngn, variant_id, products(name, image_url)",
      )
      .eq("order_id", id);

    if (itemsError) {
      logger.error(`Order items error: ${itemsError.message}`);
      return res.status(500).json({ error: "Failed to fetch order items" });
    }

    const normalizedItems = (items || []).map((item) => ({
      ...item,
      product: item.products
        ? {
            name: item.products.name,
            image_url: item.products.image_url,
          }
        : null,
      product_name: item.product_name || item.products?.name || "Product",
    }));

    res.json({ ...order, items: normalizedItems });
  } catch (err) {
    logger.error(`Order detail route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
  try {
    const { items, shipping_address, shipping_fee_ngn, service_fee_ngn } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    let calculatedSubtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const productId = item.product_id || item.id;   // ← Try both common keys

      if (!productId) {
        logger.error("Missing product_id in cart item:", item);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid cart item: missing product_id" 
        });
      }

      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const itemTotal = price * quantity;

      calculatedSubtotal += itemTotal;

      orderItemsData.push({
        product_id: productId,        // ← Guaranteed non-null
        quantity,
        price,
        subtotal_ngn: itemTotal
      });
    }

    const shipping = Number(shipping_fee_ngn) || 0;
    const service = Number(service_fee_ngn) || 0;
    const finalTotal = calculatedSubtotal + shipping + service;

    if (finalTotal <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order total" });
    }

    // Insert order
    const { data: order, error: orderError } = await req.supabase
      .from("orders")
      .insert({
        user_id: req.user?.id,
        status: "pending",
        total_ngn: finalTotal.toFixed(2),
        subtotal_ngn: calculatedSubtotal.toFixed(2),
        shipping_fee_ngn: shipping.toFixed(2),
        service_fee_ngn: service.toFixed(2),
        shipping_address: shipping_address || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert items
    const itemsToInsert = orderItemsData.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await req.supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    logger.info(`Order created: ${order.id} | Total: ₦${finalTotal}`);

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (err) {
    logger.error(`Create order error: ${err.message}`);
    res.status(500).json({ success: false, message: err.message || "Failed to create order" });
  }
});

export default router;
