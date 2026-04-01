import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, ShoppingBag, Trash2, BadgeCheck, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import catAbayas from "@/assets/cat-abayas.jpg";

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("id, product_id, products(id, name, slug, price_ngn, price_egp, image_url, badge, shipping_fee_ngn, service_fee_ngn, vendors(name, verified))")
        .eq("user_id", user.id);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const removeFromWishlist = async (wishlistId: string) => {
    await supabase.from("wishlists").delete().eq("id", wishlistId);
    setItems((prev) => prev.filter((i) => i.id !== wishlistId));
    toast.success("Removed from wishlist");
  };

  const addToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price_ngn,
      shippingFee: product.shipping_fee_ngn || 5000,
      serviceFee: product.service_fee_ngn || 2000,
      image: product.image_url || catAbayas,
      vendor: product.vendors?.name || "Egyptian Store",
    });
    toast.success("Added to bag!");
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 md:py-16">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground font-body">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body mb-4">Your wishlist is empty</p>
            <Button variant="outline" onClick={() => navigate("/")}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {items.map((item) => {
              const product = item.products;
              if (!product) return null;
              return (
                <div key={item.id} className="group bg-card rounded-lg overflow-hidden border border-border">
                  <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.slug}`)}>
                    <img src={product.image_url || catAbayas} alt={product.name} className="w-full h-full object-cover" />
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-gold text-primary-foreground text-[10px] font-body font-bold rounded uppercase tracking-wider">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    {product.vendors && (
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-emerald" />
                        <span className="text-[10px] font-body text-emerald font-medium">{product.vendors.name}</span>
                        {product.vendors.verified && <BadgeCheck className="w-3 h-3 text-emerald" />}
                      </div>
                    )}
                    <h3 className="font-body text-sm font-medium text-foreground leading-tight mb-2 line-clamp-2">{product.name}</h3>
                    <span className="font-body text-base font-bold text-primary">{formatNGN(product.price_ngn)}</span>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 bg-gradient-gold text-primary-foreground text-xs gap-1" onClick={() => addToCart(product)}>
                        <ShoppingBag className="w-3 h-3" /> Add to Bag
                      </Button>
                      <Button size="sm" variant="outline" className="border-border" onClick={() => removeFromWishlist(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
