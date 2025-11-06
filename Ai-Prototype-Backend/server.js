const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Comprehensive CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false,
  optionsSuccessStatus: 200
}));

// Additional CORS middleware for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Test CORS endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS is working!", timestamp: new Date().toISOString() });
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/fees", require("./routes/fee"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/gdbs", require("./routes/gdbRoutes"));
app.use("/api/videos", require("./routes/lectureVideoRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));


const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
