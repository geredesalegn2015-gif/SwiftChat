// app.js
// ------------------------------
// Main Express app configuration
// ------------------------------

import express from "express";
import morgan from "morgan";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./controllers/errorController.js";

// Import all route files
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import cors from "cors";
const app = express();

// 1️⃣ Middleware for development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Allow requests from your frontend
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true, // if sending cookies or auth headers
}));
// 2️⃣ Body parser (for JSON data)
app.use(express.json({ limit: "10kb" }));

// 3️⃣ Serve static files (for profile pictures)
app.use(express.static("public"));
import path from "path";

// Serve uploaded files
app.use( express.static(path.join(process.cwd(), "/uploads")));

// 4️⃣ Mount Routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

// 5️⃣ Handle all unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 6️⃣ Global error handler
app.use(globalErrorHandler);

export default app;
