import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { items, subtotal, totalShipping, totalServiceFee, total, clearCart } = useCart();

  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: user?.email || "",
    street: "",
    city: "",
    state: "Lagos",
  });

  // Handle Paystack return
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) {
      verifyPayment(reference);
    }
  }, [searchParams]);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

const handleCheckout = async () => {
  if (!user) {
    toast.error("Please log in to continue");
    navigate("/auth");
    return;
  }

  if (items.length === 0) {
    toast.error("Cart is empty");
    return;
  }

  if (!form.fullName || !form.phone || !form.email || !form.street || !form.city) {
    toast.error("Please fill all delivery information");
    return;
  }

  // Fix NaN values
  const safeSubtotal = Number(subtotal) || 0;
  const safeShipping = Number(totalShipping) || 0;
  const safeServiceFee = Number(totalServiceFee) || 0;
  const finalTotal = safeSubtotal + safeShipping + safeServiceFee;

  if (finalTotal <= 0) {
    toast.error("Invalid order total. Please check your cart prices and shipping.");
    return;
  }

  setPlacing(true);

  try {
    console.log("=== CHECKOUT DEBUG ===");
    console.log("Cart Items:", items);
    console.log("Safe Subtotal:", safeSubtotal);
    console.log("Safe Shipping:", safeShipping);
    console.log("Safe Service Fee:", safeServiceFee);
    console.log("Final Total (NGN):", finalTotal);

    // 1. Create Order
    const orderPayload = {
      items: items.map((item) => {
        // Debug what keys are actually available
        console.log("Cart item keys:", Object.keys(item));
        
        const productId = item.productId;
        
        if (!productId) {
          console.error("Missing product_id for item:", item);
        }

        return {
          product_id: productId,                    // ← This must NOT be null
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0)
        };
      }),
      shipping_address: `${form.fullName}, ${form.street}, ${form.city}, ${form.state || ''}`.trim(),
      shipping_fee_ngn: Number(totalShipping || 0),
      service_fee_ngn: Number(totalServiceFee || 0),
    };

    console.log("Final orderPayload being sent:", orderPayload);

    const orderResponse = await api.createOrder({
      ...orderPayload,
      total_price: finalTotal,
    });
    console.log("Order created successfully:", orderResponse);

    const orderId = orderResponse?.data?.id || orderResponse?.id;
    const orderTotal = Number(orderResponse?.data?.total_ngn || orderResponse?.total_ngn || finalTotal);

    if (!orderId) {
      throw new Error("Failed to create order - no order ID returned");
    }

    // Paystack expects amount in kobo (smallest unit)
    const amountInKobo = Math.round(orderTotal * 100);

    if (amountInKobo < 5000) {
      toast.error("Minimum order amount is ₦50");
      return;
    }

    console.log(`Initializing Paystack payment: ₦${orderTotal} (${amountInKobo} kobo)`);

    const paymentRes = await api.initializePayment({
      email: form.email,
      amount: amountInKobo,
      orderId: orderId,
      metadata: {
        user_id: user.id,
        order_id: orderId,
      },
    });

    if (paymentRes?.authorization_url) {
      toast.success("Redirecting to secure payment...");
      window.location.href = paymentRes.authorization_url;
    } else {
      toast.error("Failed to start payment. Please try again.");
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    toast.error(error.message || "Checkout failed. Please try again.");
  } finally {
    setPlacing(false);
  }
};
  const verifyPayment = async (reference: string) => {
    try {
      toast.success("Payment successful! Thank you for your order.");
      clearCart();
      navigate("/account/orders", { replace: true });
    } catch (err) {
      toast.error("Payment completed but verification failed. We'll check manually.");
      navigate("/account/orders");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 md:py-12 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="p-6 rounded-xl bg-card border">
              <h2 className="font-display text-lg font-bold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                  <Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                  <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+234 801 234 5678" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground mb-1 block">Street Address</label>
                  <Input value={form.street} onChange={(e) => updateField("street", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">City</label>
                  <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {nigerianStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 rounded-xl bg-card border">
              <h2 className="font-display text-lg font-bold mb-4">Order Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ''}`} className="flex gap-4 border-b pb-4 last:border-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.vendor}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" • ")}
                        </p>
                      )}
                      <div className="flex justify-between mt-2">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="font-bold">{formatNGN(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div className="sticky top-24 p-6 rounded-xl bg-card border space-y-4">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatNGN(totalShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatNGN(totalServiceFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatNGN(total)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={placing || !user}
                className="w-full h-12 mt-6 text-base font-semibold"
              >
                {placing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  "Pay with Paystack"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="w-4 h-4" />
                Secure checkout by Paystack
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;