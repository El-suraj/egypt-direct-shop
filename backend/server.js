import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import logger from "./utils/logger.js";
import { authMiddleware } from "./middleware/auth.js";
import productRoutes from "./api/routes/products.js";
import orderRoutes from "./api/routes/orders.js";
import paystackRoutes from "./api/routes/paystack.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Initialize Supabase client (will be available on req.supabase)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// Attach Supabase to request
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/payments", paystackRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
