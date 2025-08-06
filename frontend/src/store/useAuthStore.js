console.log("useAuthStore is up and running");

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios'; // Import your axios instance
import toast from 'react-hot-toast'; // Ensure toast is imported

// Initialize authUser from localStorage immediately
const initialAuthUser = JSON.parse(localStorage.getItem('authUser')) || null;

// IMPORTANT: Set Axios default header ONCE on initial load if token exists
if (initialAuthUser && initialAuthUser.token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${initialAuthUser.token}`;
    console.log("[useAuthStore] Initializing: Axios default Authorization header set from localStorage.");
} else {
    console.log("[useAuthStore] Initializing: No authUser or token found in localStorage.");
}

export const useAuthStore = create((set, get) => ({
    authUser: initialAuthUser, // Use the pre-initialized value
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true, // New state to track if auth check is in progress
    onlineUsers: [], // For future use, e.g., chat
    socket: null, // Keep socket if you intend to use it later

    // Function to set authUser and update localStorage
    setAuthUser: (user) => {
        console.log("[useAuthStore] attempting to set the user to current user as", user);
        set({ authUser: user });
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
            console.log("[useAuthStore] AuthUser set. localStorage updated.");
            // IMPORTANT FIX: Set Axios default header directly here after successful login/signup
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            console.log("[useAuthStore] Axios default Authorization header set after setAuthUser.");
        } else {
            localStorage.removeItem('authUser');
            console.log("[useAuthStore] AuthUser removed. localStorage cleared.");
            // IMPORTANT FIX: Clear Axios default header directly here on logout/clear
            delete axiosInstance.defaults.headers.common['Authorization'];
            console.log("[useAuthStore] Axios default Authorization header cleared.");
        }
    },

    checkAuth: async () => {
        console.log("[checkAuth] starting the checkAuth function");
        set({ isCheckingAuth: true });
        try {
            // The axiosInstance will now use the default header if set, or the interceptor will try localStorage
            const res = await axiosInstance.get('/auth/check');

            console.log("[useAuthStore] Server response for /auth/check:", res.data);

            if (res.data && res.data._id) {
                // When /auth/check returns successfully, it means the token was valid.
                // We need to ensure the token from localStorage is re-attached to the user object
                // because the backend's /auth/check endpoint typically doesn't return the token itself.
                const storedAuthUser = JSON.parse(localStorage.getItem('authUser'));
                const token = storedAuthUser ? storedAuthUser.token : null;

                const userWithToken = { ...res.data, token };
                get().setAuthUser(userWithToken); // This will also re-set the Axios default header
            } else {
                console.log("[useAuthStore] Server response was empty or invalid. Clearing auth.");
                get().setAuthUser(null);
            }
        } catch (error) {
            console.error('[useAuthStore] Auth check failed:', error);
            // If checkAuth fails, it means the token was invalid or missing.
            // Explicitly clear auth state and Axios header here if it's a 401,
            // as the response interceptor for /auth/check is excluded from redirect logic.
            if (error.response?.status === 401) {
                get().setAuthUser(null);
            }
        } finally {
            console.log("[checkAuth] ending the checkAuth function");
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            get().setAuthUser(res.data); // This will save to localStorage and set Axios default header
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
            // Ensure the token is part of the authUser object if it's not already
            const newUser = { ...res.data.user, token: res.data.token };
            get().setAuthUser(newUser); // This will save to localStorage and set Axios default header
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
            get().setAuthUser(null); // This will clear localStorage and Axios default header
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed.");
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            get().setAuthUser(res.data); // This will update localStorage and Axios default header
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response?.data?.message || "Profile update failed.");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
}));
