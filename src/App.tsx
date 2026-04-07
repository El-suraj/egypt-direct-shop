import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Account from "./pages/Account.tsx";
import Products from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import OrderDetail from "./pages/OrderDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminVendors from "./pages/admin/AdminVendors.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/vendors" element={<AdminVendors />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
