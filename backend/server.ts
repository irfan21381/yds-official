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
   🔐 TRUST PROXY (RENDER / REVERSE PROXY FIX)
========================================================= */
app.set("trust proxy", 1);

/* =========================================================
   🌍 CORS (JWT ONLY – NO COOKIES)
========================================================= */
app.use(
  cors({
    origin: [
      "https://yasin-digital-solutions-frontend.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

/* =========================================================
   🔐 SECURITY & BODY PARSERS
========================================================= */
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

/* =========================================================
   ⏱ RATE LIMITING (SAFE)
========================================================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* =========================================================
   🌍 ROOT ROUTE (RENDER CHECK)
========================================================= */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    message: "YDS Backend is running 🚀",
  });
});

/* =========================================================
   ❤️ HEALTH CHECK
========================================================= */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

/* =========================================================
   🚏 API ROUTES
========================================================= */
app.use("/api", routes);

/* =========================================================
   🗄 MONGODB CONNECTION + DEFAULT ADMIN
========================================================= */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yds";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // 🔥 AUTO CREATE DEFAULT SUPER_ADMIN
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
