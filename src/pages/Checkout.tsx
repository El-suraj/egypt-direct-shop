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
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { items, subtotal, totalShipping, totalServiceFee, total, clearCart } =
    useCart();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "Lagos",
  });

  // Handle Paystack callback
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) {
      verifyPayment(reference);
    }
  }, [searchParams]);

  if (!items.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground font-body">Your cart is empty.</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  const updateField = (field: string, value: string) =>
    setForm({ ...form, [field]: value });

  const verifyPayment = async (reference: string) => {
    try {
      const response = await api.post("/payments/verify", { reference });
      if (response.success) {
        clearCart();
        toast.success("Payment verified! Order confirmed.");
        navigate("/account");
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      toast.error("Error verifying payment");
    }
  };

  const initializePayment = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (
      !form.fullName ||
      !form.phone ||
      !form.email ||
      !form.street ||
      !form.city
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setPlacing(true);
    try {
      const response = await api.post("/payments/initialize", {
        email: form.email,
        amount: total,
        metadata: {
          user_id: user.id,
          shipping_address: form,
          items: items.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId || null,
            product_name: item.name,
            quantity: item.quantity,
            price_ngn: item.price,
          })),
        },
      });

      if (response.authorization_url) {
        // Redirect to Paystack
        window.location.href = response.authorization_url;
      } else {
        toast.error(response.message || "Failed to initialize payment");
        setPlacing(false);
      }
    } catch (error) {
      toast.error("Error initializing payment");
      setPlacing(false);
    }
  };

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

        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h2 className="font-display text-lg font-bold mb-4">
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    Full Name
                  </label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    Phone Number
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+234..."
                    className="bg-background border-border"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    Street Address
                  </label>
                  <Input
                    value={form.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    City
                  </label>
                  <Input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    State
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body text-foreground"
                  >
                    {nigerianStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items summary */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <h2 className="font-display text-lg font-bold mb-4">
                Order Items ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-3"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-body text-sm font-medium text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-emerald font-body">
                        {item.vendor}
                      </p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground font-body">
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                      )}
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground font-body">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-bold text-primary font-body">
                          {formatNGN(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-24 p-6 rounded-lg bg-card border border-border space-y-3">
              <h2 className="font-display text-lg font-bold mb-2">
                Order Summary
              </h2>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNGN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatNGN(totalShipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Service Fee</span>
                <span>{formatNGN(totalServiceFee)}</span>
              </div>
              <div className="flex justify-between text-base font-body font-bold pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatNGN(total)}</span>
              </div>

              <Button
                onClick={placeOrder}
                disabled={placing}
                className="w-full h-12 mt-4 bg-gradient-gold text-primary-foreground font-body font-semibold uppercase tracking-wider"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </Button>

              <div className="flex items-center gap-2 justify-center pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald" />
                <span className="text-xs text-muted-foreground font-body">
                  Secure & protected checkout
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground font-body text-center">
                Estimated delivery: 5–10 business days from Egypt
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
