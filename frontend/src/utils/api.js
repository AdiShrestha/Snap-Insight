const API_BASE_URL = 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token refresh if needed
      if (response.status === 401 && localStorage.getItem('refresh_token')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const retryHeaders = {
            ...this.getAuthHeaders(),
            ...options.headers,
          };
          const retryConfig = {
            ...options,
            headers: retryHeaders,
          };
          return fetch(url, retryConfig);
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) return false;

      const formData = new FormData();
      formData.append('refresh_token', refreshTokenValue);

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Query methods
  async submitQuery(formData) {
    return this.request('/query', {
      method: 'POST',
      body: formData,
    });
  }

  async submitCookingQuery(formData) {
    return this.request('/query/cooking', {
      method: 'POST',
      body: formData,
    });
  }

  async submitShoppingQuery(formData) {
    return this.request('/query/shopping', {
      method: 'POST',
      body: formData,
    });
  }

  async submitTravelQuery(formData) {
    return this.request('/query/travel', {
      method: 'POST',
      body: formData,
    });
  }

  async submitNewsQuery(formData) {
    return this.request('/query/news', {
      method: 'POST',
      body: formData,
    });
  }

  // User methods
  async getUserQueries() {
    const response = await this.request('/auth/queries');
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch user queries');
  }

  async getUserInfo() {
    const response = await this.request('/auth/me');
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch user info');
  }
}

export const apiClient = new ApiClient();
