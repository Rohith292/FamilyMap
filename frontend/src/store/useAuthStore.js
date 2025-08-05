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

export const useAuthStore = create((set, get) => ({
    authUser: JSON.parse(localStorage.getItem('authUser')) || null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    setAuthUser: (user) => {
        console.log("[useAuthStore] attempting to set the user to current user as", user);
        set({ authUser: user });
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            console.log("[useAuthStore] AuthUser set. Axios default Authorization header updated.");
        } else {
            localStorage.removeItem('authUser');
            delete axiosInstance.defaults.headers.common['Authorization'];
            console.log("[useAuthStore] AuthUser removed. Axios default Authorization header cleared.");
        }
    },

    // ==========================================================
    // FIX 2: Refactored checkAuth to be more resilient
    // ==========================================================
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get('/auth/check');
            
            // Assuming a successful response means the user is authenticated.
            if (res.data && res.data._id) {
                const storedAuthUser = JSON.parse(localStorage.getItem('authUser'));
                const token = storedAuthUser ? storedAuthUser.token : null;
                const userWithToken = { ...res.data, token }; 
                get().setAuthUser(userWithToken);
            } else {
                // If the response is not a valid user object, treat it as unauthenticated.
                get().setAuthUser(null);
            }
        } catch (error) {
            // A network error or an unsuccessful status code (e.g., 401)
            // means the user is not authenticated.
            console.error('[useAuthStore] Auth check failed:', error);
            get().setAuthUser(null);
        } finally {
            // This is the most crucial part: always set isCheckingAuth to false.
            // This prevents the infinite loading spinner.
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
