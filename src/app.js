import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/course.route.js";
import lessonRoutes from "./routes/lesson.route.js";
const app = express();

// MIDDLEWARE FIRST (CRITICAL ORDER)
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "http://localhost:3000",
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "LMS API is running..." });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", lessonRoutes);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

// START SERVER
const startServer = async () => {
  try {
    console.log("⏳ Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
