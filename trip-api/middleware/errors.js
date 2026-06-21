function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err.message);

  // Postgres errors
  if (err.code === "23505") return res.status(409).json({ error: "Duplicate entry" });
  if (err.code === "22P02") return res.status(400).json({ error: "Invalid UUID format" });
  if (err.code?.startsWith("23")) return res.status(400).json({ error: "Database constraint violation" });

  // Default
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && status === 500
    ? "Internal server error"
    : err.message;

  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
