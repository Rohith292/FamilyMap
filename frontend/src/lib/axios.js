// frontend/src/lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5001/api',
    withCredentials: true,
});

// Request Interceptor: Attach JWT token to every request if available
axiosInstance.interceptors.request.use(
    (config) => {
        // We only want to add the authorization header if it's not a login or signup route.
        // The auth check route now correctly uses the header.
        const isAuthRoute = config.url.includes('/auth/login') || config.url.includes('/auth/signup');

        if (!isAuthRoute) {
            let token = axiosInstance.defaults.headers.common['Authorization']?.split(' ')[1];

            if (!token) {
                // Fallback to localStorage if the default header is not set
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

        // CRITICAL FIX: The auth check failed, but this interceptor should not
        // redirect if the original request was the auth check itself.
        // The useAuthStore handles the logout/redirect logic for auth check failures.
        if (error.response.status === 401 && !originalRequest._retry && !isPublicShareApiCall && !originalRequest.url.includes('/auth/check')) {
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
