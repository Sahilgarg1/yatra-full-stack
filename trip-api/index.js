require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const tripsRouter = require("./routes/trips");
const enquiriesRouter = require("./routes/enquiries");
const systemRouter = require("./routes/system");
const { errorHandler, notFound } = require("./middleware/errors");
const { initEnquiries } = require("./services/enquiries");
const { ping } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & parsing ───────────────────────────────────────────────────────

app.use(helmet());
app.use(express.json({ limit: "50kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
app.use(limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/trips", tripsRouter);
app.use("/enquiries", enquiriesRouter);
app.use("/", systemRouter);

// ─── 404 + error handling ─────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await ping();
    console.log("✓ Database connected");
    await initEnquiries();
    console.log("✓ Enquiries table ready");
    app.listen(PORT, () => {
      console.log(`✓ API running on http://localhost:${PORT}`);
      console.log(`  GET  /trips              — list & filter trips`);
      console.log(`  GET  /trips/filters      — available filter options`);
      console.log(`  GET  /trips/:id          — single trip detail`);
      console.log(`  GET  /trips/:id/related  — related trips`);
      console.log(`  POST /enquiries          — submit enquiry`);
      console.log(`  GET  /health             — health check`);
      console.log(`  GET  /stats              — platform stats`);
    });
  } catch (err) {
    console.error("Failed to start:", err.message);
    process.exit(1);
  }
}

start();
