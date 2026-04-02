import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface FetchOptions extends RequestInit {
  body?: unknown;
}

export class APIClient {
  private baseURL: string;
  private getAuthToken: (() => Promise<string | null>) | null = null;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  setAuthTokenGetter(fn: () => Promise<string | null>) {
    this.getAuthToken = fn;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async fetch(endpoint: string, options: FetchOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    const config: FetchOptions = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    };

    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Generic HTTP methods
  async get(endpoint: string) {
    return this.fetch(endpoint, { method: "GET" });
  }

  async post(endpoint: string, body: unknown) {
    return this.fetch(endpoint, { method: "POST", body });
  }

  async put(endpoint: string, body: unknown) {
    return this.fetch(endpoint, { method: "PUT", body });
  }

  async delete(endpoint: string) {
    return this.fetch(endpoint, { method: "DELETE" });
  }

  // Products
  async getProducts(
    filters: {
      search?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    return this.fetch(`/api/products?${params.toString()}`);
  }

  async getProductDetail(productId: string) {
    const response = await this.fetch(`/api/products/${productId}`);

    // Auto-unwrap common response pattern
    if (response?.success && response.data) {
      return response.data;
    }

    return response;
  }

  // Orders
  async getOrders(
    filters: { status?: string; page?: number; limit?: number } = {},
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    return this.fetch(`/api/orders?${params.toString()}`, { method: "GET" });
  }

  async getOrderDetail(orderId: string) {
    return this.fetch(`/api/orders/${orderId}`, { method: "GET" });
  }

  async createOrder(orderData: {
    items: Array<{ product_id: string; quantity: number; price: number }>;
    shipping_address: string;
    total_price: number;
  }) {
    return this.fetch("/api/orders", {
      method: "POST",
      body: orderData,
    });
  }

  // Payments
  async initializePayment(paymentData: {
    email: string;
    amount: number;
    orderId: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.fetch("/api/payments/initialize", {
      method: "POST",
      body: paymentData,
    });
  }
}

// Singleton instance
export const apiClient = new APIClient(API_URL);

// Alias for backwards compatibility
export const api = apiClient;

// Hook for setting auth token in React components
export function useApiClient() {
  const { session } = useAuth();

  // Set token getter when auth context is available
  if (!apiClient["getAuthToken"] && session) {
    apiClient.setAuthTokenGetter(async () => session.access_token);
  }

  return apiClient;
}
