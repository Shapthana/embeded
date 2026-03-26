const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/sensorData.json");

// Create file if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

const readData = () => {
  const rawData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(rawData || "[]");
};

const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const receiveSensorData = (req, res) => {
  try {
    const { mq2, temp, hum, lat, lng } = req.body;

    if (
      mq2 === undefined ||
      temp === undefined ||
      hum === undefined ||
      lat === undefined ||
      lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "mq2, temp, hum, lat, and lng are required",
      });
    }

    const newEntry = {
      id: Date.now(),
      mq2: Number(mq2),
      temp: Number(temp),
      hum: Number(hum),
      lat: Number(lat),
      lng: Number(lng),
      createdAt: new Date().toISOString(),
    };

    const data = readData();
    data.push(newEntry);
    writeData(data);

    return res.status(201).json({
      success: true,
      message: "Sensor data saved successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllSensorData = (req, res) => {
  try {
    const data = readData();

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error reading sensor data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getLatestSensorData = (req, res) => {
  try {
    const data = readData();

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sensor data found",
      });
    }

    const latest = data[data.length - 1];

    return res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (error) {
    console.error("Error getting latest sensor data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  receiveSensorData,
  getAllSensorData,
  getLatestSensorData,
};