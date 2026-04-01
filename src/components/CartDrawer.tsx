import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, itemCount, subtotal, totalShipping, totalServiceFee, total } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">
            Shopping Bag <span className="text-muted-foreground text-sm font-body">({itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground font-body">Your bag is empty</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body text-sm font-medium text-foreground truncate">{item.name}</h4>
                    <p className="text-[10px] text-emerald font-body">{item.vendor}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {[item.size, item.color].filter(Boolean).join(" / ")}
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary font-body mt-1">{formatNGN(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-foreground">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-body font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-foreground">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="ml-auto text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatNGN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">{formatNGN(totalShipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="text-foreground">{formatNGN(totalServiceFee)}</span>
              </div>
              <div className="flex justify-between text-base font-body font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatNGN(total)}</span>
              </div>
              <Button
                className="w-full mt-3 bg-gradient-gold text-primary-foreground font-body font-semibold uppercase tracking-wider"
                onClick={() => { setIsOpen(false); navigate("/checkout"); }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
