// frontend/src/App.jsx

import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

// Import your pages/components
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

// Import stores
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

// ==========================================================
// FIX 1: Refactored App component for more robust routing
// ==========================================================
const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        // Only run the auth check once on app load
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        // Applies the selected theme to the root <html> tag
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Show a global loader while checking authentication status.
    // This is crucial to prevent the infinite redirect loop.
    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex">
                <Routes>
                    {/* Public Routes: Redirect to home if user is logged in */}
                    <Route 
                        path="/signup" 
                        element={authUser ? <Navigate to="/" /> : <SignUpPage />} 
                    />
                    <Route 
                        path="/login" 
                        element={authUser ? <Navigate to="/" /> : <LoginPage />} 
                    />

                    {/* Authenticated Routes: Redirect to login if user is not logged in */}
                    <Route 
                        path="/" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/albums" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/albums/:albumId" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/family-groups" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/family-groups/:groupId" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/family-groups/:groupId/albums/:albumId" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/sharing" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/analytics" 
                        element={authUser ? <HomePage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/settings" 
                        element={authUser ? <SettingsPage /> : <Navigate to="/login" />} 
                    />
                    <Route 
                        path="/profile" 
                        element={authUser ? <ProfilePage /> : <Navigate to="/login" />} 
                    />

                    {/* Public share link route (accessible without auth) */}
                    <Route 
                        path="/share/:uniqueShareId" 
                        element={<HomePage />} 
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            <Toaster />
        </div>
    );
};

export default App;
