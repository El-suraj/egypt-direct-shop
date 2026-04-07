import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Loader2, Upload, CreditCard, Building2, CheckCircle2 } from "lucide-react";

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const nigerianStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const BANK_DETAILS = {
  bankName: "Zenith Bank",
  accountNumber: "1234567890",
  accountName: "Egypt Plugs Ltd",
};

type PaymentMethod = "card" | "bank_transfer";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, totalShipping, totalServiceFee, total, clearCart } = useCart();

  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [orderCreated, setOrderCreated] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: user?.email || "",
    street: "",
    city: "",
    state: "Lagos",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const createOrder = async (): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const safeSubtotal = Number(subtotal) || 0;
    const safeShipping = Number(totalShipping) || 0;
    const safeServiceFee = Number(totalServiceFee) || 0;
    const finalTotal = safeSubtotal + safeShipping + safeServiceFee;

    if (finalTotal <= 0) throw new Error("Invalid order total");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal_ngn: safeSubtotal,
        shipping_fee_ngn: safeShipping,
        service_fee_ngn: safeServiceFee,
        total_ngn: finalTotal,
        shipping_address: {
          full_name: form.fullName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
        },
        payment_method: paymentMethod,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      price_ngn: item.price,
      variant_id: item.variantId || null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return order.id;
  };

  const uploadReceipt = async (orderId: string, file: File) => {
    if (!user) throw new Error("Not authenticated");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${orderId}.${ext}`;

    const { error } = await supabase.storage
      .from("payment-receipts")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    // Update order with payment reference
    await supabase
      .from("orders")
      .update({ payment_reference: path, payment_method: "bank_transfer" })
      .eq("id", orderId);
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
    if (paymentMethod === "bank_transfer" && !receiptFile) {
      toast.error("Please upload your transfer receipt");
      return;
    }

    setPlacing(true);
    try {
      const orderId = await createOrder();

      if (paymentMethod === "bank_transfer" && receiptFile) {
        setUploading(true);
        await uploadReceipt(orderId, receiptFile);
        setUploading(false);
      }

      toast.success("Order placed successfully!");
      clearCart();
      setOrderCreated(orderId);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setPlacing(false);
      setUploading(false);
    }
  };

  // Success screen
  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center max-w-lg mx-auto">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-6">
            {paymentMethod === "bank_transfer"
              ? "Your order has been received. We'll confirm your payment and begin processing."
              : "Payment received. Your order is being processed."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/order/${orderCreated}`)}>View Order</Button>
            <Button variant="outline" onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Continue Shopping</Button>
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
          {/* Left Column */}
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
                    {nigerianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-xl bg-card border">
              <h2 className="font-display text-lg font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Building2 className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Upload receipt after transfer</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Card Payment</p>
                    <p className="text-xs text-muted-foreground">Pay via Paystack (coming soon)</p>
                  </div>
                </button>
              </div>

              {/* Bank Transfer Details */}
              {paymentMethod === "bank_transfer" && (
                <div className="mt-5 space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                    <p className="text-sm font-semibold mb-2">Transfer to:</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Bank:</span> {BANK_DETAILS.bankName}</p>
                      <p><span className="text-muted-foreground">Account No:</span> <span className="font-mono font-bold">{BANK_DETAILS.accountNumber}</span></p>
                      <p><span className="text-muted-foreground">Account Name:</span> {BANK_DETAILS.accountName}</p>
                      <p><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-primary">{formatNGN(total)}</span></p>
                    </div>
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Transfer Receipt</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                        receiptFile ? "border-green-500 bg-green-500/5" : "border-border hover:border-primary/50"
                      }`}>
                        <Upload className={`w-5 h-5 ${receiptFile ? "text-green-500" : "text-muted-foreground"}`} />
                        <div>
                          {receiptFile ? (
                            <p className="text-sm font-medium text-green-700">{receiptFile.name}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Click to upload receipt (image or PDF)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Card payment via Paystack is coming soon. Please use bank transfer for now.</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="p-6 rounded-xl bg-card border">
              <h2 className="font-display text-lg font-bold mb-4">Order Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ""}`} className="flex gap-4 border-b pb-4 last:border-0">
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
                disabled={placing || !user || paymentMethod === "card"}
                className="w-full h-12 mt-6 text-base font-semibold"
              >
                {placing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {uploading ? "Uploading Receipt..." : "Placing Order..."}
                  </>
                ) : paymentMethod === "bank_transfer" ? (
                  "Place Order"
                ) : (
                  "Pay with Paystack"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="w-4 h-4" />
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
