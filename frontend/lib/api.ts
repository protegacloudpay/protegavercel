const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Always get fresh token from localStorage
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : this.token;
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    company_name?: string;
    phone?: string;
    role?: 'merchant' | 'customer';
  }) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          company_name: data.company_name,
          phone: data.phone,
          role: data.role || 'merchant',
        }),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  logout() {
    this.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_email');
      localStorage.removeItem('customer_fingerprint');
    }
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }


  // Customer endpoints
  async registerCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    fingerprint_hash: string;
  }): Promise<{ customer_id: string }> {
    return this.request<{ customer_id: string }>('/api/customers/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyFingerprint(fingerprint_hash: string) {
    return this.request<{
      verified: boolean;
      customer_id?: string;
      is_new: boolean;
    }>('/api/customers/verify-fingerprint', {
      method: 'POST',
      body: JSON.stringify({ fingerprint_hash }),
    });
  }

  async getCustomerProfile() {
    return this.request('/api/customers/profile');
  }

  async updateCustomerProfile(data: any) {
    return this.request('/api/customers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPaymentMethods() {
    return this.request('/api/customers/payment-methods');
  }

  async addPaymentMethod(data: {
    type: string;
    name: string;
    last4: string;
    encrypted_data: string;
    is_default?: boolean;
  }) {
    return this.request('/api/customers/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async createTransaction(data: {
    amount: number;
    items: Array<{ name: string; price: number }>;
    fingerprint_hash: string;
    payment_method_id?: number;
    pos_provider?: string;
  }): Promise<{
    transaction_id: string;
    total: number;
    status: string;
    payment_provider?: string;
    provider_transaction_id?: string;
    client_secret?: string;
  }> {
    return this.request<{
      transaction_id: string;
      total: number;
      status: string;
      payment_provider?: string;
      provider_transaction_id?: string;
      client_secret?: string;
    }>('/api/transactions/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(skip = 0, limit = 100) {
    return this.request(`/api/transactions?skip=${skip}&limit=${limit}`);
  }

  // Merchant endpoints
  async getMerchantStats() {
    return this.request('/api/merchant/stats');
  }

  async getMerchantCustomers(skip = 0, limit = 100) {
    return this.request(`/api/merchant/customers?skip=${skip}&limit=${limit}`);
  }

  // Inventory endpoints
  async getInventory() {
    return this.request('/api/inventory');
  }

  async createInventoryItem(data: {
    name: string;
    barcode?: string;
    price: number;
    category?: string;
    stock?: number;
  }) {
    return this.request('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: number, data: {
    name: string;
    barcode?: string;
    price: number;
    category?: string;
    stock?: number;
  }) {
    return this.request(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: number) {
    return this.request(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  async getInventoryByBarcode(barcode: string): Promise<{ name: string; price: number; barcode: string } | null> {
    return this.request<{ name: string; price: number; barcode: string } | null>(`/api/inventory/barcode/${barcode}`);
  }
}

export const api = new ApiClient(API_BASE_URL);

