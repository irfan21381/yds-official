import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";

import routes from "./routes";
import { createDefaultAdmin } from "./utils/createDefaultAdmin";

const app = express();

/* =========================================================
   🔐 TRUST PROXY
========================================================= */
app.set("trust proxy", 1);

/* =========================================================
   🌍 CORS
========================================================= */
app.use(
  cors({
    origin: [
      "https://yasin-digital-solutions-frontend.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

/* =========================================================
   🔐 SECURITY
========================================================= */
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

/* =========================================================
   ⏱ RATE LIMIT
========================================================= */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* =========================================================
   🌍 ROOT
========================================================= */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    message: "YDS Backend is running 🚀",
  });
});

/* =========================================================
   ❤️ HEALTH
========================================================= */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

/* =========================================================
   🚏 API ROUTES
========================================================= */
app.use("/api", routes);

/* =========================================================
   🗄 MONGODB
========================================================= */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yds";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await createDefaultAdmin();
  })
  .catch((err: Error) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* =========================================================
   🚀 START SERVER
========================================================= */
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
