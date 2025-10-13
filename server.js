const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/hse_management",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/safety-observations", require("./routes/safetyObservations"));
app.use("/api/induction-training", require("./routes/inductionTraining"));
app.use("/api/daily-training", require("./routes/dailyTraining"));
app.use("/api/pep-talk", require("./routes/pepTalk"));
app.use("/api/special-training", require("./routes/specialTraining"));
app.use(
  "/api/safety-advisory-warning",
  require("./routes/safetyAdvisoryWarning")
);
app.use("/api/stop-work-order", require("./routes/stopWorkOrder"));
app.use("/api/first-aid", require("./routes/firstAid"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/csv-upload", require("./routes/csvUpload"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "HSE Management Backend",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
