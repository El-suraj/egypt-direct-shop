import express from "express";
import logger from "../../utils/logger.js";

const router = express.Router();

// GET /api/products - Get all products with search and filtering
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      minPrice = 0,
      maxPrice = 999999,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    let query = req.supabase
      .from("products")
      .select(
        "id, name, description, price_ngn, price_egp, shipping_fee_ngn, service_fee_ngn, category_id, images, image_url, rating, review_count, vendor_id, in_stock, badge",
      );

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Category filter
    if (category) {
      // Check if category is a UUID or a slug
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          category,
        );

      if (isUUID) {
        // Direct UUID match
        query = query.eq("category_id", category);
      } else {
        // Slug match - need to look up the ID
        const { data: categoryData } = await req.supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();

        if (categoryData) {
          query = query.eq("category_id", categoryData.id);
        }
      }
    }

    // Price range filter (using NGN as primary currency)
    query = query.gte("price_ngn", minPrice).lte("price_ngn", maxPrice);

    // Sorting
    const orderConfig = {
      newest: { column: "created_at", ascending: false },
      oldest: { column: "created_at", ascending: true },
      price_asc: { column: "price_ngn", ascending: true },
      price_desc: { column: "price_ngn", ascending: false },
      rating: { column: "rating", ascending: false },
    };

    const order = orderConfig[sort] || orderConfig.newest;
    query = query.order(order.column, { ascending: order.ascending });

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Build count query with same filters
    let countQuery = req.supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if (search) {
      countQuery = countQuery.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }
    if (category) {
      // Check if category is a UUID or a slug
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          category,
        );

      if (isUUID) {
        countQuery = countQuery.eq("category_id", category);
      } else {
        // Slug match - need to look up the ID
        const { data: categoryData } = await req.supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();

        if (categoryData) {
          countQuery = countQuery.eq("category_id", categoryData.id);
        }
      }
    }
    countQuery = countQuery
      .gte("price_ngn", minPrice)
      .lte("price_ngn", maxPrice);

    // Get total count with filters applied
    const { count } = await countQuery;

    const { data: products, error } = await query;

    if (error) {
      logger.error(`Product query error: ${error.message}`);
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    res.json({
      products: products || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    logger.error(`Products route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id - Get single product details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await req.supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      logger.error(`Product detail error: ${error.message}`);
      return res.status(500).json({ error: "Failed to fetch product" });
    }

    // Get vendor, Category, and variants info
    const [vendorRes, categoryRes, variantsRes] = await Promise.all([
      product.vendor_id
        ? req.supabase
            .from("vendors")
            .select("id, name, rating, verified, location")
            .eq("id", product.vendor_id)
            .single()
        : null,
      product.category_id
        ? req.supabase
            .from("categories")
            .select("id, name, slug")
            .eq("id", product.category_id)
            .single()
        : null,
      req.supabase.from("product_variants").select("*").eq("product_id", id),
    ]);

    res.json({
      ...product,
      vendor: vendorRes?.data || null,
      category: categoryRes?.data || null,
      variants: variantsRes?.data || [],
    });
  } catch (err) {
    logger.error(`Product detail route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/categories - Get all product categories (public endpoint)
router.get("/categories/all", async (req, res) => {
  try {
    const { data: categories, error } = await req.supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    if (error) {
      logger.error(`Categories query error: ${error.message}`);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.json(categories || []);
  } catch (err) {
    logger.error(`Categories route error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
