// frontend/src/lib/axios.js
// Configures the Axios instance with interceptors for JWT.
// This version fixes the /auth/check token issue by correctly reading from localStorage
// and always attaching the token if available.
// ==========================================================
import axios from "axios";

export const axiosInstance = axios.create({
    // Use VITE_API_URL from environment variables, fallback to localhost for dev
    baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5001/api',
    withCredentials: true, // Essential for sending cookies (http-only cookies from the backend).
});

// Request Interceptor: Attach JWT token to every request if available
axiosInstance.interceptors.request.use(
    (config) => {
        // IMPORTANT FIX: Read from the correct localStorage key 'authUser'
        const authUserString = localStorage.getItem('authUser');
        let token = null;

        if (authUserString) {
            try {
                const authUser = JSON.parse(authUserString);
                // IMPORTANT FIX: Access the token directly from the parsed object
                token = authUser.token;
            } catch (e) {
                console.error("[Axios Request Interceptor] Error parsing authUser from localStorage:", e);
                // Clear invalid localStorage item if it's malformed
                localStorage.removeItem('authUser');
            }
        }

        // Always attempt to attach the token if it exists, regardless of the route.
        // The backend will handle authorization for specific routes.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[Axios Request Interceptor] Authorization header set for: ${config.url}`);
        } else {
            // Ensure no Authorization header is sent if no token is found
            delete config.headers.Authorization;
            console.log(`[Axios Request Interceptor] No token found for: ${config.url}. Authorization header NOT set.`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle token expiration or unauthorized responses
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Determine if the original request was for a public share map API call
        const isPublicShareApiCall = originalRequest.url.includes('/family/map') && originalRequest.params && originalRequest.params.shareId;

        // Handle 401 Unauthorized errors (e.g., token expired).
        // We only want to redirect if:
        // 1. It's a 401 status.
        // 2. The request hasn't already been retried.
        // 3. It's NOT a public share API call (which might be accessible without auth).
        // 4. It's NOT the login or signup route itself (to prevent loops).
        // 5. It's NOT the /auth/check route (the checkAuth function handles its own logout logic).
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicShareApiCall &&
            !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/signup') &&
            !originalRequest.url.includes('/auth/check')) {

            originalRequest._retry = true; // Mark the request as retried to prevent infinite loops

            console.warn("401 Unauthorized: Token expired or invalid. Forcing logout.");
            // IMPORTANT FIX: Clear the correct localStorage key
            localStorage.removeItem('authUser');
            // Force a page reload and redirect to login page
            window.location.href = '/login';
        } else if (error.response?.status === 403 && !originalRequest._retry) {
            console.warn("403 Forbidden: You do not have permission for this action.");
            // You might want to display a toast here or redirect to an access denied page
            // toast.error("You do not have permission to perform this action.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
