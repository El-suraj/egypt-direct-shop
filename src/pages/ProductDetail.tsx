import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Heart,
  ShoppingBag,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  Truck,
  Star,
  ArrowLeft,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
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

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_egp: number;
  price_ngn: number;
  shipping_fee_ngn: number | null;
  service_fee_ngn: number | null;
  image_url: string | null;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  vendor_id: string | null;
  category_id: string | null;
};

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  in_stock: boolean | null;
  stock_count: number | null;
  price_adjustment_ngn: number | null;
};

type Vendor = {
  id: string;
  name: string;
  location: string | null;
  verified: boolean | null;
  rating: number | null;
  total_sales: number | null;
};
type Category = { slug: string };

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const p = response;
        if (!p) {
          setLoading(false);
          return;
        }
        setProduct(p);
        setVariants(p.variants || []);
        setVendor(p.vendor || null);
        setCategory(p.category || null);
      } catch (error) {
        console.error("Failed to load product:", error);
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const sizes = useMemo(
    () => [...new Set(variants.filter((v) => v.size).map((v) => v.size!))],
    [variants],
  );
  const colors = useMemo(
    () => [...new Set(variants.filter((v) => v.color).map((v) => v.color!))],
    [variants],
  );

  const selectedVariant = useMemo(() => {
    if (!sizes.length && !colors.length) return null;
    return (
      variants.find(
        (v) =>
          (!sizes.length || v.size === selectedSize) &&
          (!colors.length || v.color === selectedColor),
      ) || null
    );
  }, [variants, selectedSize, selectedColor, sizes, colors]);

  useEffect(() => {
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
    if (colors.length && !selectedColor) setSelectedColor(colors[0]);
  }, [sizes, colors, selectedSize, selectedColor]);

  const imageUrl =
    product?.image_url ||
    (category?.slug ? placeholderImages[category.slug] : catAbayas);
  const adjustedPrice =
    (product?.price_ngn || 0) + (selectedVariant?.price_adjustment_ngn || 0);
  const shippingFee = product?.shipping_fee_ngn || 5000;
  const serviceFee = product?.service_fee_ngn || 2000;

  const toggleWishlist = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!product) return;
    if (wishlisted) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      setWishlisted(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (sizes.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (colors.length && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: adjustedPrice,
      shippingFee,
      serviceFee,
      image: imageUrl,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      vendor: vendor?.name || "Egyptian Store",
    });
    toast.success("Added to bag!");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <div className="animate-pulse text-muted-foreground font-body">
            Loading...
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground font-body">Product not found.</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Go Home
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 font-body"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-[3/4] rounded-lg overflow-hidden bg-card"
          >
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-gold text-primary-foreground text-xs font-body font-bold rounded uppercase tracking-wider">
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {vendor && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-emerald" />
                <span className="text-xs font-body text-emerald font-medium">
                  {vendor.name}
                </span>
                {vendor.verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald" />
                )}
                <span className="text-xs text-muted-foreground font-body">
                  • {vendor.location}
                </span>
              </div>
            )}

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              {product.name}
            </h1>

            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-body font-medium">
                    {product.rating}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-body">
                  ({product.review_count} reviews)
                </span>
              </div>
            )}

            {/* Price breakdown */}
            <div className="p-4 rounded-lg bg-card border border-border mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground font-body">
                  Product Price
                </span>
                <span className="text-lg font-bold text-primary font-body">
                  {formatNGN(adjustedPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Original (EGP)</span>
                <span className="text-muted-foreground">
                  EGP {product.price_egp.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {formatNGN(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="text-foreground">{formatNGN(serviceFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-body font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatNGN(adjustedPrice + shippingFee + serviceFee)}
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 bg-emerald/10 text-emerald text-[9px] font-body font-semibold rounded uppercase tracking-wider">
                Original Store Price
              </span>
            </div>

            {/* Variants */}
            {colors.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-body font-medium text-foreground mb-2 block">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg border text-sm font-body transition-colors ${
                        selectedColor === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-body font-medium text-foreground mb-2 block">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded-lg border text-sm font-body font-medium transition-colors ${
                        selectedSize === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-body font-medium text-foreground mb-2 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground hover:border-primary/50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-body font-medium w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground hover:border-primary/50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-gradient-gold text-primary-foreground font-body font-semibold uppercase tracking-wider gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 border-border ${wishlisted ? "text-red-500" : ""}`}
                onClick={toggleWishlist}
              >
                <Heart
                  className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`}
                />
              </Button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { icon: ShieldCheck, text: "100% Authentic" },
                { icon: Truck, text: "5-10 Days Delivery" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
                >
                  <Icon className="w-4 h-4 text-emerald" />
                  <span className="text-xs font-body text-muted-foreground">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8">
                <h3 className="font-display text-lg font-bold mb-3">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Vendor info */}
            {vendor && (
              <div className="mt-8 p-4 rounded-lg bg-card border border-border">
                <h3 className="font-display text-lg font-bold mb-2">
                  About the Store
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-body font-medium text-foreground">
                    {vendor.name}
                  </span>
                  {vendor.verified && (
                    <BadgeCheck className="w-4 h-4 text-emerald" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                  <span>📍 {vendor.location}</span>
                  {vendor.rating && <span>⭐ {vendor.rating}/5</span>}
                  {vendor.total_sales && (
                    <span>{vendor.total_sales.toLocaleString()} sales</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
