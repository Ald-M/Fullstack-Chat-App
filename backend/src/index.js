// index.js (or server.js)
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ------------------
// DEBUG HELPERS
// ------------------
const _use = app.use.bind(app);
app.use = (path, ...rest) => {
  console.log("Registering route with app.use:", path);
  return _use(path, ...rest);
};

const _get = app.get.bind(app);
app.get = (path, ...rest) => {
  console.log("Registering GET route:", path);
  return _get(path, ...rest);
};

// ------------------
// MIDDLEWARE
// ------------------
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ------------------
// ROUTES
// ------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ------------------
// PRODUCTION BUILD
// ------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // IMPORTANT: Express 5 doesn't like "*" anymore
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ------------------
// START SERVER
// ------------------
server.listen(PORT, () => {
  console.log("✅ Server is running on port: " + PORT);
  connectDB();
});
