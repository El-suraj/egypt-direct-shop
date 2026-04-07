import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Receipt, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";

const ORDER_STATUSES = Constants.public.Enums.order_status;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  purchased_egypt: "bg-blue-500/10 text-blue-500",
  in_transit: "bg-purple-500/10 text-purple-500",
  arrived_nigeria: "bg-cyan-500/10 text-cyan-500",
  out_for_delivery: "bg-orange-500/10 text-orange-500",
  delivered: "bg-green-500/10 text-green-500",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchOrders = async () => {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus as any);
    }

    const { data } = await query;
    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setOrderItems(data || []);
    setDetailOpen(true);
  };

  const viewReceipt = async (order: any) => {
    if (!order.payment_reference) {
      toast.error("No receipt uploaded for this order");
      return;
    }

    const { data } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(order.payment_reference, 300);

    if (data?.signedUrl) {
      setReceiptUrl(data.signedUrl);
      setSelectedOrder(order);
      setReceiptOpen(true);
    } else {
      toast.error("Could not load receipt");
    }
  };

  const confirmPayment = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "purchased_egypt" as any })
      .eq("id", orderId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Payment confirmed! Order moved to Purchased in Egypt.");
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "purchased_egypt" });
      }
      setReceiptOpen(false);
    }
  };

  const rejectPayment = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" as any })
      .eq("id", orderId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Order cancelled.");
      fetchOrders();
      setReceiptOpen(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as any })
      .eq("id", orderId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₦{Number(order.total_ngn).toLocaleString()}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) => updateStatus(order.id, v)}
                      >
                        <SelectTrigger className="w-40 h-8">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[order.status] || ""
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {order.payment_method === "bank_transfer" ? "Bank Transfer" : order.payment_method || "—"}
                        </span>
                        {order.payment_reference && order.payment_method === "bank_transfer" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => viewReceipt(order)}
                            title="View receipt"
                          >
                            <Receipt className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => viewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground">
                      {selectedOrder.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-medium text-foreground">
                      {selectedOrder.payment_method === "bank_transfer" ? "Bank Transfer" : selectedOrder.payment_method || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Receipt</p>
                    {selectedOrder.payment_reference ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => {
                          setDetailOpen(false);
                          viewReceipt(selectedOrder);
                        }}
                      >
                        View Receipt <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    ) : (
                      <p className="text-muted-foreground text-xs">Not uploaded</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-medium">₦{Number(selectedOrder.subtotal_ngn).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping</p>
                    <p className="font-medium">₦{Number(selectedOrder.shipping_fee_ngn).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Service Fee</p>
                    <p className="font-medium">₦{Number(selectedOrder.service_fee_ngn).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-primary">₦{Number(selectedOrder.total_ngn).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                  <div className="bg-muted/30 rounded-lg p-3 text-sm text-foreground">
                    {typeof selectedOrder.shipping_address === "object" ? (
                      <>
                        <p>{(selectedOrder.shipping_address as any).full_name}</p>
                        <p>{(selectedOrder.shipping_address as any).street}</p>
                        <p>
                          {(selectedOrder.shipping_address as any).city},{" "}
                          {(selectedOrder.shipping_address as any).state}
                        </p>
                        <p>{(selectedOrder.shipping_address as any).phone}</p>
                      </>
                    ) : (
                      <p>{String(selectedOrder.shipping_address)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-muted/30 rounded-lg p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ₦{Number(item.price_ngn).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Receipt Viewer Dialog */}
        <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Transfer Receipt — Order #{selectedOrder?.id.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-4">
                <div>
                  <p className="text-muted-foreground">Order Total</p>
                  <p className="font-bold text-primary">₦{Number(selectedOrder?.total_ngn || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">Bank Transfer</p>
                </div>
              </div>

              {/* Receipt Image */}
              {receiptUrl && (
                <div className="border rounded-lg overflow-hidden bg-muted/20">
                  {receiptUrl.includes(".pdf") ? (
                    <div className="p-8 text-center">
                      <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">PDF Receipt</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                          Open PDF <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={receiptUrl}
                      alt="Transfer receipt"
                      className="w-full max-h-[400px] object-contain"
                    />
                  )}
                </div>
              )}

              {/* Action buttons */}
              {selectedOrder?.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => confirmPayment(selectedOrder.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => rejectPayment(selectedOrder.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject & Cancel
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
