// ==========================================================
// frontend/src/lib/axios.js
// Configures the Axios instance with interceptors for JWT.
// This version fixes the /auth/check token issue.
// ==========================================================
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5001/api',
    withCredentials: true, // Essential for sending cookies (http-only cookies from the backend).
});

// Request Interceptor: Attach JWT token to every request if available
axiosInstance.interceptors.request.use(
    (config) => {
        // We only want to add the authorization header if it's not a login or signup route.
        // NOTE: The /auth/check route is now treated like any other authenticated route
        // and WILL send the token if available, resolving the 401 issue.
        const isAuthRoute = config.url.includes('/auth/login') || config.url.includes('/auth/signup');

        if (!isAuthRoute) {
            // CRITICAL FIX: Read from 'auth-storage' key as used by Zustand persist.
            const authUser = JSON.parse(localStorage.getItem('auth-storage'));
            const token = authUser?.state?.authUser?.token; // Access the token from the nested state

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log(`[Axios Request Interceptor] Token attached for: ${config.url}`);
            } else {
                // If no token, ensure no Authorization header is sent.
                delete config.headers.Authorization;
                console.log(`[Axios Request Interceptor] No token found for: ${config.url}. Authorization header NOT set.`);
            }
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

        // Handle 401 Unauthorized errors (e.g., token expired).
        // This check is crucial to prevent an infinite redirect loop.
        // We only want to redirect if the original request was NOT already retried
        // and was NOT a public share API call, AND was NOT the auth check itself.
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicShareApiCall && !originalRequest.url.includes('/auth/check')) {
            originalRequest._retry = true; // Mark the request as retried to prevent infinite loops

            console.warn("401 Unauthorized: Token expired or invalid. Logging out.");
            localStorage.removeItem('auth-storage'); // Clear the entire stored state
            window.location.href = '/login'; // Force a page reload and redirect to login page
        } else if (error.response?.status === 403 && !originalRequest._retry) {
            console.warn("403 Forbidden: You do not have permission for this action.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
