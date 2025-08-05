import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

// Request Interceptor: Attach JWT token to every request if available
axiosInstance.interceptors.request.use(
  (config) => {
    // For /auth/check, we explicitly don't want a token attached in the header,
    // as it relies on the http-only cookie.
    if (config.url.includes('/auth/check')) {
      delete config.headers.Authorization;
      console.log(`[Axios Request Interceptor] No token attached for: ${config.url} (Auth Check)`);
      return config;
    }

    // Prioritize the Authorization header already set in axiosInstance defaults (by useAuthStore).
    // If not set there, then try localStorage.
    let token = axiosInstance.defaults.headers.common['Authorization']?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) { // If not found in defaults, try localStorage as a fallback
      const authUser = JSON.parse(localStorage.getItem('authUser'));
      token = authUser?.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[Axios Request Interceptor] Token attached for: ${config.url}`);
    } else {
      // If no token, ensure no Authorization header is sent.
      delete config.headers.Authorization;
      console.log(`[Axios Request Interceptor] No token found for: ${config.url}. Authorization header NOT set.`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration or unauthorized responses conditionally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Determine if the original request was for a public share map API call
    const isPublicShareApiCall = originalRequest.url.includes('/family/map') && originalRequest.params && originalRequest.params.shareId;

    if (error.response.status === 401 && !originalRequest._retry && !isPublicShareApiCall) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      console.warn("401 Unauthorized: Token expired or invalid. Logging out.");
      localStorage.removeItem('authUser'); // Clear stored user data
      window.location.href = '/login'; // Redirect to login page

    } else if (error.response.status === 403 && !originalRequest._retry) {
      console.warn("403 Forbidden: You do not have permission for this action.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
