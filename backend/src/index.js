import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import familyRoutes from "./routes/family.route.js";
import shareRoutes from "./routes/share.route.js";
import collaborationRoutes from "./routes/collaboration.route.js";
import albumRoutes from "./routes/album.route.js";
import familyGroupRoutes from "./routes/familyGroup.route.js"
import analyticsRoutes from "./routes/analytics.route.js";


dotenv.config();

const app=express();
const PORT = process.env.PORT || 5001; // Use 5001 as a fallback if PORT is not set
const __dirname = path.resolve(); // Define __dirname

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Add logging middleware
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Serve static assets from the frontend's dist folder
// This must be placed before any routes that might serve index.html



// API routes - all prefixed with /api
app.use("/api/auth", authRoutes);
app.use("/api/family",familyRoutes);
app.use("/api/share",shareRoutes);
app.use("/api/collaboration",collaborationRoutes);
app.use("/api/albums",albumRoutes);
app.use('/api/family-groups', familyGroupRoutes);
app.use('/api/analytics',analyticsRoutes);


// Specific route for public share links (frontend access)
// This must be placed AFTER API routes, but BEFORE the general catch-all.
app.get("/share/:uniqueShareId", (req, res) => {
    console.log(`Serving index.html for public share link: /share/${req.params.uniqueShareId}`);
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});


// Catch-all route for all other GET requests not handled by API or specific routes.
// This ensures that all client-side routes (e.g., /login, /signup, /settings, /profile)
// also serve the index.html, allowing React Router to take over.
// This must be the LAST route handler for GET requests.
// Using the standard Express wildcard '*'


app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB(); // Re-enable DB connection
});
