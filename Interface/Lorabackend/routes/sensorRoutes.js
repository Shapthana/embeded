const express = require("express");
const router = express.Router();

const {
  receiveSensorData,
  getAllSensorData,
  getLatestSensorData,
} = require("../controllers/sensorController");

router.post("/sensor-data", receiveSensorData);
router.get("/sensor-data", getAllSensorData);
router.get("/sensor-data/latest", getLatestSensorData);

module.exports = router;