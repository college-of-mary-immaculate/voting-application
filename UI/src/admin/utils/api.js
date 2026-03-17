// API utility with authentication token
const API = {
  getAuthToken() {
    return localStorage.getItem("token");
  },

  getHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },

  async request(endpoint, options = {}) {
    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    // 401 = not logged in
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized - Please login again");
    }

    // 403 = not allowed (admin only)
    if (response.status === 403) {
      // optional redirect
      window.location.href = "/login";

      throw new Error("Forbidden - Admin access required");
    }

    return response;
  },

  async get(endpoint) {
    const response = await this.request(endpoint, { method: "GET" });
    return response.json();
  },

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await this.request(endpoint, { method: "DELETE" });
    return response.json();
  },
};

export default API;
