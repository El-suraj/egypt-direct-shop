import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, DollarSign, Truck } from "lucide-react";
import { toast } from "sonner";

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const StatusBadgeColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) throw new Error("Order ID required");
      const response = await api.get(`/api/orders/${id}`);
      return response;
    },
    enabled: !!id && !!user,
    retry: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">
            Please log in to view orders
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button variant="outline" onClick={() => navigate("/account")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusColor =
    StatusBadgeColor[order.status] || "bg-gray-100 text-gray-800";
  const createdDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/account")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>

        <div className="max-w-3xl">
          {/* Order Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-3xl font-bold mb-2">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {createdDate}
                </p>
              </div>
              <Badge className={`${statusColor} text-sm px-4 py-2`}>
                {order.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-8 p-6 rounded-lg bg-card border border-border">
            <h2 className="font-display font-bold mb-6">Order Status</h2>
            <div className="relative">
              {/* Timeline */}
              <div className="space-y-4">
                {[
                  { status: "pending", label: "Order Placed" },
                  { status: "confirmed", label: "Confirmed" },
                  { status: "processing", label: "Processing" },
                  { status: "shipped", label: "Shipped" },
                  { status: "delivered", label: "Delivered" },
                ].map((step, index) => {
                  const isCompleted =
                    [
                      "pending",
                      "confirmed",
                      "processing",
                      "shipped",
                      "delivered",
                    ].indexOf(order.status) >= index;
                  const isCurrent = order.status === step.status;

                  return (
                    <div key={step.status} className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isCompleted ? "bg-primary" : "bg-muted"
                        } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8 p-6 rounded-lg bg-card border border-border">
            <h2 className="font-display font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b border-border last:border-0"
                >
                  {item.product?.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product_name}
                      className="w-20 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{item.product_name}</h4>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && " • "}
                        {item.variant.color && `Color: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatNGN(item.price_ngn * item.quantity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNGN(item.price_ngn)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Delivery Address
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">
                  {order.shipping_address?.fullName}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address?.street}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address?.city},{" "}
                  {order.shipping_address?.state}
                </p>
                <p className="text-muted-foreground">
                  Phone: {order.shipping_address?.phone}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatNGN(order.subtotal_ngn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatNGN(order.shipping_fee_ngn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatNGN(order.service_fee_ngn)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatNGN(order.total_ngn)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-display font-bold mb-4">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">
                  {order.payment_method?.replace(/_/g, " ")}
                </span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs">
                    {order.payment_reference}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">
                  {order.payment_status || "PENDING"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
