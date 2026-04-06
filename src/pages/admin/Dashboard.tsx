import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, customersRes, recentRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id, status, total_ngn, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Get revenue
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total_ngn")
        .neq("status", "cancelled");

      const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total_ngn), 0) || 0;

      setStats({
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        customers: customersRes.count || 0,
        revenue,
      });
      setRecentOrders(recentRes.data || []);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.products,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "text-accent",
    },
    {
      label: "Customers",
      value: stats.customers,
      icon: Users,
      color: "text-secondary-foreground",
    },
    {
      label: "Revenue",
      value: `₦${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    purchased_egypt: "bg-blue-500/10 text-blue-500",
    in_transit: "bg-purple-500/10 text-purple-500",
    arrived_nigeria: "bg-cyan-500/10 text-cyan-500",
    out_for_delivery: "bg-orange-500/10 text-orange-500",
    delivered: "bg-green-500/10 text-green-500",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status] || ""
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        ₦{Number(order.total_ngn).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
