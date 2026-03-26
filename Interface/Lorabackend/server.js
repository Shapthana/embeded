const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const sensorRoutes = require("./routes/sensorRoutes");
app.use("/api", sensorRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("LoRa backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});