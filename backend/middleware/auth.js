import logger from "../utils/logger.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await req.supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn(
        `Authentication failed: ${error?.message || "Invalid token"}`,
      );
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err.message}`);
    res.status(500).json({ error: "Authentication error" });
  }
};
