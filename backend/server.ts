import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import routes from "./routes";

const app = express();

/* =========================================================
   🔥 CORS (MUST BE FIRST)
========================================================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.options("*", cors());

/* =========================================================
   🔐 Security & Parsers
========================================================= */
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

/* =========================================================
   ⏱ Rate Limiting
========================================================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

/* =========================================================
   ❤️ Health Check
========================================================= */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

/* =========================================================
   🚏 Routes
========================================================= */
app.use("/api", routes);

/* =========================================================
   🗄 MongoDB
========================================================= */
const MONGO_URI =
  process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/yds";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err: Error) =>
    console.error("❌ MongoDB connection failed:", err.message)
  );

/* =========================================================
   🚀 Start Server
========================================================= */
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
