/* ============================================================
   api.js  —  Backend API calls for CraveMart
   Sab frontend pages yahi use karenge
   ============================================================ */

// const API_BASE = 'http://localhost:3001/api';
const API_BASE = 'https://cravemart.onrender.com/api';

const API = {

  // ── Helper: headers with token
  headers(json = true) {
    const token = localStorage.getItem('cm_token');
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  // ── Helper: handle response
  async handle(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },

  /* ── AUTH ──────────────────────────────────────── */

  // Register new user
  async register({ firstName, lastName, email, phone, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify({ firstName, lastName, email, phone, password }),
    });
    const data = await this.handle(res);
    // Save token + user
    if (data.token) {
      localStorage.setItem('cm_token', data.token);
      Auth.setUser({
        name:  data.user.firstName + ' ' + data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        role:  data.user.role,
        id:    data.user.id,
      });
    }
    return data;
  },

  // Login existing user
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify({ email, password }),
    });
    const data = await this.handle(res);
    if (data.token) {
      localStorage.setItem('cm_token', data.token);
      Auth.setUser({
        name:  data.user.firstName + ' ' + data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
        role:  data.user.role,
        id:    data.user.id,
      });
    }
    return data;
  },

  // Get current user
  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: this.headers() });
    return this.handle(res);
  },

  /* ── PRODUCTS ──────────────────────────────────── */

  async getProducts(filter = '') {
    const url = filter && filter !== 'all'
      ? `${API_BASE}/products?category=${filter}`
      : `${API_BASE}/products`;
    const res = await fetch(url);
    return this.handle(res);
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return this.handle(res);
  },

  /* ── ORDERS ────────────────────────────────────── */

  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify(orderData),
    });
    return this.handle(res);
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my`, { headers: this.headers() });
    return this.handle(res);
  },

  /* ── PAYMENTS ──────────────────────────────────── */

  async createStripeSession(items, couponCode) {
    const res = await fetch(`${API_BASE}/payments/create-session`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify({ items, couponCode }),
    });
    return this.handle(res);
  },
};
