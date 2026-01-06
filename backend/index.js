require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const insightRoutes = require("./routes/Insight");

const app = express();

app.use(cors(
    {
        origin: 'https://chart-analytics-gamma.vercel.app',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use("/api/insights", insightRoutes);

app.get("/", (req, res) => {
  res.send("Visualization Dashboard API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
