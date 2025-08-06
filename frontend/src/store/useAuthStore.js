console.log("useAuthStore is up and running");

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios'; // Import your axios instance
import toast from 'react-hot-toast'; // Ensure toast is imported

// Initialize authUser from localStorage immediately
const initialAuthUser = JSON.parse(localStorage.getItem('authUser')) || null;

// Set Axios default header if a token exists on initial load
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
      // Set default Authorization header for axiosInstance
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      console.log("[useAuthStore] AuthUser set. Axios default Authorization header updated."); // Debug log
    } else {
      localStorage.removeItem('authUser');
      // Remove default Authorization header
      delete axiosInstance.defaults.headers.common['Authorization'];
      console.log("[useAuthStore] AuthUser removed. Axios default Authorization header cleared."); // Debug log
    }
  },

  checkAuth: async () => {
    console.log("[checkAuth] starting the checkAuth function");
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get('/auth/check');

      console.log("[useAuthStore] Server response for /auth/check:", res.data);

      // CRITICAL FIX: The server returns the user object directly in res.data
      // We'll check for its existence and its _id.
      if (res.data && res.data._id) {
        const storedAuthUser = JSON.parse(localStorage.getItem('authUser'));
        const token = storedAuthUser ? storedAuthUser.token : null;

        // We use the direct res.data and add the token to it
        const userWithToken = { ...res.data, token };

        get().setAuthUser(userWithToken);
      } else {
        // If there's no user in the response, clear the auth state
        console.log("[useAuthStore] Server response was empty or invalid. Clearing auth.");
        get().setAuthUser(null);
      }
    } catch (error) {
      console.error('[useAuthStore] Auth check failed:', error);
      get().setAuthUser(null);
    } finally {
      console.log("[checkAuth] ending the checkAuth function");
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      get().setAuthUser(res.data); // Use the setAuthUser helper
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
      get().setAuthUser(newUser); // Use the setAuthUser helper
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
      get().setAuthUser(null); // Use the setAuthUser helper
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      get().setAuthUser(res.data); // Use the setAuthUser helper
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed.");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
