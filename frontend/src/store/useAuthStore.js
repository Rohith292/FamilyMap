// ==========================================================
// frontend/src/store/useAuthStore.js
// ==========================================================
console.log("useAuthStore is up and running");

import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast'; 

// CRITICAL FIX: The base URL should be configured in an instance.
// Ensure your axiosInstance.js file correctly sets the base URL with '/api'.
// This is a placeholder for demonstration.
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

const useAuthStore = create((set) => ({
    // State variables
    authUser: JSON.parse(localStorage.getItem('authUser')) || null,
    isCheckingAuth: true,
    
    // Derived state for convenience
    isAuthenticated: () => !!useAuthStore.getState().authUser,

    // Actions
    setAuthUser: (authUser) => {
        if (authUser) {
            localStorage.setItem('authUser', JSON.stringify(authUser));
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authUser.token}`;
            set({ authUser });
            console.log("[useAuthStore] AuthUser set. Axios default Authorization header updated.");
        } else {
            localStorage.removeItem('authUser');
            delete axiosInstance.defaults.headers.common['Authorization'];
            set({ authUser: null });
            console.log("[useAuthStore] AuthUser removed. Axios default Authorization header cleared.");
        }
    },

    checkAuth: async () => {
        // Set loading state to true to indicate we're checking auth
        set({ isCheckingAuth: true });
        
        try {
            console.log("[useAuthStore] Checking authentication status...");
            // The axios interceptor will attach the token from localStorage
            const response = await axiosInstance.get('/auth/check');
            
            // If the check is successful, ensure the local storage user is still valid
            const authUser = JSON.parse(localStorage.getItem('authUser'));
            if (authUser) {
                useAuthStore.getState().setAuthUser(authUser);
            } else {
                // If local storage is empty, clear the state
                useAuthStore.getState().setAuthUser(null);
            }
            
            console.log("[useAuthStore] Auth check successful.");
        } catch (error) {
            console.log("[useAuthStore] Auth check failed:", error.response.data.message);
            // On any error (e.g., 401), clear the user state
            useAuthStore.getState().setAuthUser(null);
        } finally {
            // Set loading state to false once the check is complete
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            get().setAuthUser(res.data);
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed.");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            const newUser = { ...res.data.user, token: res.data.token }; 
            get().setAuthUser(newUser);
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed.");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            get().setAuthUser(null);
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed.");
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            get().setAuthUser(res.data);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response?.data?.message || "Profile update failed.");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
}));
