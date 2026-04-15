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
  const [tab, setTab] = useState<"profile" | "orders" | "wishlist" | "addresses">("profile");
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const resolvedUserId = authUser?.id || user?.id;
      if (!resolvedUserId) return [];

      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", resolvedUserId);
      const isAdmin = (roleRows || []).some((row) => row.role === "admin");

      try {
        // Backend endpoint is user-scoped; avoid short-circuiting admin view with [].
        if (!isAdmin) {
          const response = await api.get("/api/orders");
          const apiOrders = response?.orders || response?.data?.orders;
          if (Array.isArray(apiOrders)) {
            return apiOrders;
          }
        } else {
          const response = await api.get("/api/orders");
          const apiOrders = response?.orders || response?.data?.orders;
          if (Array.isArray(apiOrders) && apiOrders.length > 0) {
            return apiOrders;
          }
        }
      } catch (_error) {
        // Fall back to direct Supabase query if backend auth/API is unavailable.
      }

      let ordersQuery = supabase
        .from("orders")
        .select("id, user_id, status, total_ngn, created_at, shipping_address")
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        ordersQuery = ordersQuery.eq("user_id", resolvedUserId);
      }

      const { data, error } = await ordersQuery;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });

  const orders = ordersData || [];
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSessionUserId(data.user?.id || null);
    });
  }, []);

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
  } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("addresses")
        .select("id, full_name, phone, street, city, state, label, is_default")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });

  const addresses = addressesData || [];
  const {
    data: wishlistData,
    isLoading: wishlistLoading,
    error: wishlistError,
  } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wishlists")
        .select("id, product_id, products(id, name, slug, image_url, price_ngn)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });
  const wishlistItems = wishlistData || [];
  const orderDerivedAddresses =
    orders
      ?.map((order: any) => order?.shipping_address)
      .filter((address: any) => address && typeof address === "object")
      .map((address: any, index: number) => ({
        id: `order-address-${index}`,
        full_name: address.full_name || address.fullName || "Recipient",
        phone: address.phone || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        label: "From Order",
        is_default: index === 0,
      })) || [];
  const displayAddresses =
    addresses.length > 0 ? addresses : orderDerivedAddresses;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setIsAdmin((data || []).some((row) => row.role === "admin"));
      });

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
    { id: "wishlist" as const, label: "Wishlist", icon: Heart },
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
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium text-primary hover:bg-primary/10"
              >
                <ArrowRight className="w-4 h-4" /> Admin Dashboard
              </button>
            )}
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
                {/* {import.meta.env.DEV && (
                  <div className="mb-4 p-3 rounded-lg border border-border bg-muted/30 text-xs font-mono">
                    <p>context user.id: {user.id}</p>
                    <p>session user.id: {sessionUserId || "null"}</p>
                    <p>orders fetched: {orders.length}</p>
                  </div>
                )} */}
                {ordersLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : ordersError ? (
                  <p className="text-destructive font-body text-sm">
                    Unable to load your orders right now.
                  </p>
                ) : orders.length === 0 ? (
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

            {tab === "wishlist" && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4">My Wishlist</h2>
                {wishlistLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : wishlistError ? (
                  <p className="text-destructive font-body text-sm">
                    Unable to load your wishlist right now.
                  </p>
                ) : wishlistItems.length === 0 ? (
                  <p className="text-muted-foreground font-body">
                    No items in wishlist yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {wishlistItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg bg-card border border-border flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-body font-medium">
                            {item.products?.name || "Product"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatNGN(Number(item.products?.price_ngn || 0))}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/product/${item.products?.slug || item.product_id}`)
                          }
                        >
                          View
                        </Button>
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
                {addressesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : addressesError ? (
                  <p className="text-destructive font-body text-sm">
                    Unable to load your saved addresses right now.
                  </p>
                ) : displayAddresses.length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm">
                    No saved addresses yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {displayAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 rounded-lg bg-card border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-body font-semibold text-sm">
                            {address.full_name}
                          </p>
                          {address.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-body">
                          {address.street}
                        </p>
                        <p className="text-sm text-muted-foreground font-body">
                          {address.city}, {address.state}
                        </p>
                        <p className="text-sm text-muted-foreground font-body mt-1">
                          {address.phone}
                        </p>
                        {address.label && (
                          <p className="text-xs text-muted-foreground font-body mt-2 uppercase tracking-wide">
                            {address.label}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
