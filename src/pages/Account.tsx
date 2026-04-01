import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
  ArrowRight,
  Calendar,
} from "lucide-react";

const Account = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // Fetch orders from API
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/api/orders");
      return response.orders || [];
    },
    enabled: !!user,
  });

  const orders = ordersData || [];

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data)
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
          });
      });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "orders" as const, label: "Orders", icon: Package },
    { id: "addresses" as const, label: "Addresses", icon: MapPin },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    purchased_egypt: "bg-blue-500/10 text-blue-500",
    in_transit: "bg-purple-500/10 text-purple-500",
    arrived_nigeria: "bg-emerald/10 text-emerald",
    out_for_delivery: "bg-primary/10 text-primary",
    delivered: "bg-emerald/10 text-emerald",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 md:py-16">
        <h1 className="font-display text-3xl font-bold mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-56 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium transition-colors ${
                  tab === t.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/wishlist")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground"
            >
              <Heart className="w-4 h-4" /> Wishlist
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {tab === "profile" && (
              <div className="max-w-md space-y-4">
                <h2 className="font-display text-xl font-bold mb-4">
                  Profile Details
                </h2>
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    Email
                  </label>
                  <Input
                    value={user.email || ""}
                    disabled
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    Full Name
                  </label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-body mb-1 block">
                    Phone
                  </label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="+234..."
                    className="bg-card border-border"
                  />
                </div>
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-gradient-gold text-primary-foreground font-body font-semibold uppercase tracking-wider"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4">
                  Order History
                </h2>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground font-body">
                    No orders yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg bg-card border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-body font-mono">
                            {order.id.slice(0, 8)}...
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase ${statusColors[order.status] || ""}`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-body text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-sm font-body font-bold text-primary">
                            {formatNGN(order.total_ngn)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4">
                  Saved Addresses
                </h2>
                <p className="text-muted-foreground font-body text-sm">
                  Addresses saved during checkout will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
