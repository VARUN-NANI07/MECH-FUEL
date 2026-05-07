// src/utils/api.js

// If running in the browser on the live site, prefer the Render backend directly
let API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5001");
try {
  if (typeof window !== 'undefined' && window.location.hostname.includes('mechfuel.me')) {
    // The Vercel deployment may not forward POST /api requests correctly — call Render backend directly.
    API_BASE = process.env.REACT_APP_API_URL || 'https://mech-fuel.onrender.com';
  }
} catch (e) {
  // ignore; fallback to build-time value
}

// ---------------- Helper Function ----------------
async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  // attach token if present and auth=true
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || "Request failed");
    error.details = data.details || [];
    error.status = res.status;
    throw error;
  }

  return data;
}

// ---------------- Auth APIs ----------------
export const authApi = {
  register: (payload) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  login: (payload) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  getProfile: () => apiRequest("/auth/profile"),
};

// ---------------- Fuel order APIs ----------------
// MATCHES BACKEND → /api/fuel-orders
export const fuelApi = {
  createOrder: (payload) =>
    apiRequest("/fuel-orders", {
      method: "POST",
      body: payload,
    }),

  getMyOrders: () => apiRequest("/fuel-orders"),
  deleteOrder: (orderId) =>
    apiRequest(`/fuel-orders/${orderId}`, {
      method: "DELETE",
    }),};

// ---------------- Mechanical service APIs ----------------
// MATCHES BACKEND → /api/mechanical-services
export const mechApi = {
  createRequest: (payload) =>
    apiRequest("/mechanical-services", {
      method: "POST",
      body: payload,
    }),

  getMyServices: () => apiRequest("/mechanical-services"),

  getServiceTypes: () => apiRequest("/mechanical-services/types", { auth: false }),
  deleteService: (serviceId) =>
    apiRequest(`/mechanical-services/${serviceId}`, {
      method: "DELETE",
    }),};

// ---------------- User APIs ----------------
export const userApi = {
  getDashboard: () => apiRequest("/users/dashboard"),

  getOrders: () => apiRequest("/users/orders"),

  updateProfile: (payload) =>
    apiRequest("/users/profile", {
      method: "PATCH",
      body: payload,
    }),
};

// Export apiRequest for general use
export { apiRequest };
