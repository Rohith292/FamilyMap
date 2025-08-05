// ==========================================================
// frontend/src/store/useAuthStore.js
// ==========================================================
console.log("useAuthStore is up and running");

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios'; // <<<<< IMPORTANT: Import the configured instance!
import toast from 'react-hot-toast'; 

export const useAuthStore = create((set, get) => ({
    // State variables
    authUser: JSON.parse(localStorage.getItem('authUser')) || null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    
    // Actions
    setAuthUser: (authUser) => {
        if (authUser) {
            localStorage.setItem('authUser', JSON.stringify(authUser));
            set({ authUser });
            console.log("[useAuthStore] AuthUser set.");
        } else {
            localStorage.removeItem('authUser');
            set({ authUser: null });
            console.log("[useAuthStore] AuthUser removed.");
        }
    },

    checkAuth: async () => {
        // Set loading state to true to indicate we're checking auth
        set({ isCheckingAuth: true });
        
        try {
            console.log("[useAuthStore] Checking authentication status...");
            // The axios interceptor will handle attaching the token from localStorage
            await axiosInstance.get('/auth/check');
            
            // If the check is successful, we know our localStorage token is valid
            const authUser = JSON.parse(localStorage.getItem('authUser'));
            if (authUser) {
                get().setAuthUser(authUser);
            } else {
                get().setAuthUser(null);
            }
            
            console.log("[useAuthStore] Auth check successful.");
        } catch (error) {
            console.log("[useAuthStore] Auth check failed:", error.response?.data?.message || error.message);
            // On any error (e.g., 401), clear the user state
            get().setAuthUser(null);
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
