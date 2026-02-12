// src/utils/api.js

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

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
    throw new Error(data.error || "Request failed");
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
};

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
};

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
