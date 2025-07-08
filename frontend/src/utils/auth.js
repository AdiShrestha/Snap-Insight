/**
 * Authentication utility functions
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Get stored access token
 */
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

/**
 * Clear stored tokens
 */
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    // Simple check - decode JWT to see if it's expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const formData = new FormData();
  formData.append('refresh_token', refreshToken);

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    storeTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } else {
    clearTokens();
    throw new Error('Failed to refresh token');
  }
};

/**
 * Make authenticated API request
 */
export const authenticatedFetch = async (url, options = {}) => {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  // Add authorization header
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };

  let response = await fetch(url, authOptions);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      authOptions.headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(url, authOptions);
    } catch (error) {
      clearTokens();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw error;
    }
  }

  return response;
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Failed to get user info');
  }
};

/**
 * Get user's query history
 */
export const getUserQueries = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/queries`);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Failed to get user queries');
  }
};

/**
 * Logout user
 */
export const logout = () => {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};
