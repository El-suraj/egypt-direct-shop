import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { label: "New Arrivals", href: "/products", category: null },
  { label: "Abayas", href: "/products", category: "arabian-clothing" },
  { label: "Shoes", href: "/products", category: "shoes" },
  { label: "Bags", href: "/products", category: "bags-accessories" },
  { label: "Accessories", href: "/products", category: "bags-accessories" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { setIsOpen, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsAdmin((data || []).some((row) => row.role === "admin"));
    };
    checkAdmin();
  }, [user]);

  return (
    <>
      <div className="bg-primary/10 border-b border-border">
        <div className="container flex items-center justify-center py-2">
          <p className="text-xs font-body tracking-wider text-primary">
            🇪🇬 Direct from Cairo — Original Store Prices — Free Shipping Over
            ₦100,000
          </p>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl md:text-2xl font-bold text-gradient-gold">
              Egypt Plugs
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={
                  link.category
                    ? `${link.href}?category=${link.category}`
                    : link.href
                }
                className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => (user ? navigate("/wishlist") : navigate("/auth"))}
              className="hidden md:flex p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => (user ? navigate("/account") : navigate("/auth"))}
              className="hidden md:flex p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="hidden md:flex px-3 py-1.5 text-xs font-body font-semibold rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors uppercase tracking-wide"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-gold text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </button>
            <button
              className="lg:hidden p-2 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="container py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={
                      link.category
                        ? `${link.href}?category=${link.category}`
                        : link.href
                    }
                    className="text-sm font-body font-medium text-foreground py-2 tracking-wide uppercase"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-4 pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      user ? navigate("/wishlist") : navigate("/auth");
                    }}
                    className="text-sm text-muted-foreground flex items-center gap-2 font-body"
                  >
                    <Heart className="w-4 h-4" /> Wishlist
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      user ? navigate("/account") : navigate("/auth");
                    }}
                    className="text-sm text-muted-foreground flex items-center gap-2 font-body"
                  >
                    <User className="w-4 h-4" /> Account
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/admin");
                      }}
                      className="text-sm text-primary flex items-center gap-2 font-body"
                    >
                      <User className="w-4 h-4" /> Admin Dashboard
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
