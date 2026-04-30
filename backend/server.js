import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import qaRoutes from "./routes/qaRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", qaRoutes);
app.use("/api", settingsRoutes);
app.use("/api", historyRoutes);
app.use(notFound);
app.use(errorHandler);

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Backend running on ${PORT}`)))
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
