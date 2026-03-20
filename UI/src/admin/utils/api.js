// API utility with authentication token
const API = {
  getBaseURL() {
    return "http://localhost:3000";
  },

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
    const response = await fetch(`${this.getBaseURL()}/api${endpoint}`, {
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

  async upload(endpoint, formData) {
    const token = this.getAuthToken();
    
    try {
      const response = await fetch(`${this.getBaseURL()}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Upload Error (${endpoint}):`, error);
      throw error;
    }
  },

  // Helper function to get full image URL
  getImageUrl(photoUrl) {
    if (!photoUrl) return null;
    // If it's already a full URL, use it as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    // Otherwise, prepend the base URL
    return `${this.getBaseURL()}${photoUrl}`;
  }
};

export default API;