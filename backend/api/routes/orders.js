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
      .select("id, status, total_price, created_at, shipping_address", {
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
      .select("id, product_id, quantity, price, products(name, images)")
      .eq("order_id", id);

    if (itemsError) {
      logger.error(`Order items error: ${itemsError.message}`);
      return res.status(500).json({ error: "Failed to fetch order items" });
    }

    res.json({ ...order, items });
  } catch (err) {
    logger.error(`Order detail route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shipping_address, total_price } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Order must contain at least one item" });
    }

    // Create order
    const { data: order, error: orderError } = await req.supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total_price,
        shipping_address,
      })
      .select()
      .single();

    if (orderError) {
      logger.error(`Order creation error: ${orderError.message}`);
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await req.supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      logger.error(`Order items creation error: ${itemsError.message}`);
      return res.status(500).json({ error: "Failed to create order items" });
    }

    res.status(201).json(order);
  } catch (err) {
    logger.error(`Order creation route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
