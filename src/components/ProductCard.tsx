import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price_ngn: number;
  rating: number;
  image_url: string;
  in_stock: boolean;
  badge?: string;
  category?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  if (!product?.id) {
    console.warn("ProductCard received product without ID:", product);
    return null; // or a placeholder
  }

const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();           // Important: prevent link navigation
    if (!product.in_stock) {
      toast.error("Product out of stock");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price_ngn,
      quantity: 1,
    });
    toast.success("Added to cart");
  };

const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();           // Important: prevent link navigation
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative mb-4 rounded-lg overflow-hidden bg-muted aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {product.badge && (
              <Badge className="bg-primary text-primary-foreground">
                {product.badge}
              </Badge>
            )}
            {!product.in_stock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <div className="flex gap-2 w-full px-3">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleWishlist}
                className="px-3"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category?.name}
          </p>
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>

          {/* Price */}
          <p className="font-bold text-lg text-primary">
            {formatNGN(product.price_ngn)}
          </p>
        </div>
      </div>
    </Link>
  );
};

import React from "react";

export default ProductCard;
