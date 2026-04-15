import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, BadgeCheck, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import catAbayas from "@/assets/cat-abayas.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catBags from "@/assets/cat-bags.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";

const placeholderImages: Record<string, string> = {
  abayas: catAbayas,
  shoes: catShoes,
  bags: catBags,
  accessories: catAccessories,
};

const formatNGN = (amount: number) => `₦${amount.toLocaleString()}`;

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts({ limit: 8, sort: "newest" });
        // console.log("Featured Products Response:", response);
        // Handle different possible response shapes
        const fetchedProducts =
          response?.data?.products ||
          response?.products ||
          response?.data ||
          [];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const loadWishlistState = async () => {
      if (!user || products.length === 0) return;
      const productIds = products.map((p) => p.id).filter(Boolean);
      if (productIds.length === 0) return;

      const { data } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id)
        .in("product_id", productIds);

      setWishlistedIds(new Set((data || []).map((item) => item.product_id)));
    };

    loadWishlistState();
  }, [user, products]);

  const handleAddToBag = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price_ngn,
      shippingFee: product.shipping_fee_ngn || 5000,
      serviceFee: product.service_fee_ngn || 2000,
      image:
        product.image_url ||
        placeholderImages[product.categories?.slug] ||
        catAbayas,
      vendor: product.vendors?.name || "Egyptian Store",
    });
    toast.success("Added to bag!");
  };

  const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to use wishlist");
      navigate("/auth");
      return;
    }

    if (wishlistedIds.has(productId)) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) {
        toast.error("Failed to remove from wishlist");
        return;
      }
      const updated = new Set(wishlistedIds);
      updated.delete(productId);
      setWishlistedIds(updated);
      toast.success("Removed from wishlist");
      return;
    }

    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id: productId });
    if (error) {
      toast.error("Failed to add to wishlist");
      return;
    }
    const updated = new Set(wishlistedIds);
    updated.add(productId);
    setWishlistedIds(updated);
    toast.success("Added to wishlist");
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Featured <span className="text-gradient-gold">Products</span>
            </h2>
            <p className="text-muted-foreground font-body">
              Handpicked from verified Egyptian vendors
            </p>
          </div>
          <a
            href="#"
            className="hidden md:inline-flex text-sm font-body font-medium text-primary hover:text-gold-light transition-colors uppercase tracking-wide"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product, i) => {
            const imageUrl =
              product.image_url ||
              placeholderImages[product.categories?.slug] ||
              catAbayas;
            return (
              <motion.div
                key={product.id || `product-${i}`} // Fallback key if product.id is missing
                className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => {
                  if (product.id) {
                    navigate(`/product/${product.id}`);
                  }
                }}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-gold text-primary-foreground text-[10px] font-body font-bold rounded uppercase tracking-wider">
                      {product.badge}
                    </span>
                  )}
                  <button
                    className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Add to wishlist"
                    onClick={(e) => toggleWishlist(product.id, e)}
                  >
                    <Heart
                      className={`w-4 h-4 ${wishlistedIds.has(product.id) ? "fill-current text-primary" : ""}`}
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => handleAddToBag(product, e)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-body font-semibold rounded uppercase tracking-wider"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                    </button>
                  </div>
                </div>

                <div className="p-3 md:p-4">
                  {product.vendors && (
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-emerald" />
                      <span className="text-[10px] font-body text-emerald font-medium">
                        {product.vendors.name}
                      </span>
                      {product.vendors.verified && (
                        <BadgeCheck className="w-3 h-3 text-emerald" />
                      )}
                    </div>
                  )}
                  <h3 className="font-body text-sm font-medium text-foreground leading-tight mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-body text-base font-bold text-primary">
                      {formatNGN(product.price_ngn)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-body">
                      EGP {product.price_egp}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="px-1.5 py-0.5 bg-emerald/10 text-emerald text-[9px] font-body font-semibold rounded uppercase tracking-wider">
                      Original Price
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="md:hidden text-center mt-8">
          <a
            href="#"
            className="text-sm font-body font-medium text-primary uppercase tracking-wide"
          >
            View All Products →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
