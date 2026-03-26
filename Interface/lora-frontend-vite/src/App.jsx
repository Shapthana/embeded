import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function formatTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function App() {
  const [latestData, setLatestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestRes = await axios.get(
          "http://localhost:5000/api/sensor-data/latest"
        );
        const historyRes = await axios.get(
          "http://localhost:5000/api/sensor-data"
        );

        setLatestData(latestRes.data.data);
        setHistoryData(historyRes.data.data || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    return historyData.slice(-12).map((item) => ({
      time: item.createdAt
        ? new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      temp: Number(item.temp) || 0,
      hum: Number(item.hum) || 0,
      mq2: Number(item.mq2) || 0,
    }));
  }, [historyData]);

  const alertItems = useMemo(() => {
    if (!latestData) return [];

    const mq2 = Number(latestData.mq2) || 0;
    const temp = Number(latestData.temp) || 0;
    const hum = Number(latestData.hum) || 0;

    const alerts = [];

    if (mq2 >= 120) {
      alerts.push({
        title: "High Smoke Level Detected",
        time: latestData.createdAt ? `${formatTime(latestData.createdAt)}` : "Now",
        tone: "red",
        icon: "⚠",
      });
    }

    if (temp >= 30) {
      alerts.push({
        title: "Temperature Rising Above Threshold",
        time: latestData.createdAt ? `${formatTime(latestData.createdAt)}` : "Now",
        tone: "orange",
        icon: "🔥",
      });
    }

    if (hum <= 40) {
      alerts.push({
        title: "Low Humidity Condition",
        time: latestData.createdAt ? `${formatTime(latestData.createdAt)}` : "Now",
        tone: "orange",
        icon: "💧",
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        title: "System Stable - No Critical Alerts",
        time: latestData.createdAt ? `${formatTime(latestData.createdAt)}` : "Now",
        tone: "green",
        icon: "✓",
      });
    }

    return alerts.slice(0, 3);
  }, [latestData]);

  const stats = useMemo(() => {
    if (!latestData) return [];

    return [
      {
        title: "Temperature",
        value: latestData.temp ?? "N/A",
        unit: "°C",
        trend: "Live reading",
        icon: "🌡",
      },
      {
        title: "Humidity",
        value: latestData.hum ?? "N/A",
        unit: "%",
        trend: "Live reading",
        icon: "💧",
      },
      {
        title: "Smoke Level",
        value: latestData.mq2 ?? "N/A",
        unit: "PPM",
        trend: "MQ2 sensor",
        icon: "〰",
      },
      {
        title: "System Status",
        value: "ACTIVE",
        unit: "",
        trend: latestData.createdAt
          ? `Updated ${formatTime(latestData.createdAt)}`
          : "Waiting for sync",
        icon: "✓",
      },
    ];
  }, [latestData]);

  const lat = Number(latestData?.lat);
  const lng = Number(latestData?.lng);
  const hasValidCoords = !Number.isNaN(lat) && !Number.isNaN(lng);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">△</div>
          <div>
            <h2 className="brand-title">Fire Guard</h2>
            <p className="brand-subtitle">IoT System</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button className="nav-item active" type="button">
            <span className="nav-icon-grid" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            Dashboard
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            Sensor network monitoring
            <br />
            Real-time wildfire risk tracking
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>Forest Fire Monitoring Dashboard</h1>
            <p>Real-time environmental sensor monitoring via LoRa network</p>
          </div>

          <div className="topbar-actions">
            <div className="connection-badge">📶 LoRa Connected</div>
            <div className="topbar-icon has-dot">🔔</div>
            <div className="topbar-icon">👤</div>
          </div>
        </header>

        <div className="content">
          {error && <p className="error">{error}</p>}
          {!latestData && !error && <p className="loading">Loading...</p>}

          {latestData && (
            <>
              <section className="stats-grid">
                {stats.map((item) => (
                  <div className="stat-card" key={item.title}>
                    <div>
                      <div className="stat-card-label">{item.title}</div>
                      <div className="stat-card-value">
                        <strong>{item.value}</strong>
                        {item.unit && <span>{item.unit}</span>}
                      </div>
                      <div className="stat-card-trend">{item.trend}</div>
                    </div>
                    <div className="stat-card-icon">{item.icon}</div>
                  </div>
                ))}
              </section>

              <section className="dashboard-grid">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">GPS Location Tracking</h2>
                      <p className="panel-subtitle">
                        Real-time sensor node positioning
                      </p>
                    </div>
                  </div>

                  {hasValidCoords ? (
                    <>
                      <div className="map-wrapper large-map">
                        <MapContainer
                          center={[lat, lng]}
                          zoom={15}
                          scrollWheelZoom={true}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[lat, lng]}>
                            <Popup>
                              MQ2: {latestData.mq2}
                              <br />
                              Temp: {latestData.temp} °C
                              <br />
                              Humidity: {latestData.hum} %
                              <br />
                              Updated: {formatDateTime(latestData.createdAt)}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>

                      <div className="map-info-wrap">
                        <div className="coord-grid">
                          <div className="coord-card">
                            <div className="coord-label">Latitude</div>
                            <p className="coord-value">{lat.toFixed(6)}°</p>
                          </div>

                          <div className="coord-card">
                            <div className="coord-label">Longitude</div>
                            <p className="coord-value">{lng.toFixed(6)}°</p>
                          </div>
                        </div>

                        <div className="sensor-card">
                          <div>
                            <div className="sensor-label">Sensor Node</div>
                            <p className="sensor-value">Forest Sector A3</p>
                          </div>
                          <span className="sensor-status-dot" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="map-info-wrap">
                      <p className="error">Invalid GPS coordinates</p>
                    </div>
                  )}
                </div>

                <div className="panel alerts-panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Fire Alerts</h2>
                    </div>
                    <div className="panel-badge">{alertItems.length} Active</div>
                  </div>

                  <div className="alerts-list">
                    {alertItems.map((alert, index) => (
                      <div
                        className={`alert-card ${alert.tone}`}
                        key={`${alert.title}-${index}`}
                      >
                        <div className="alert-icon">{alert.icon}</div>
                        <div>
                          <h3 className="alert-title">{alert.title}</h3>
                          <p className="alert-time">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel chart-panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Sensor Readings Overview</h2>
                    <p className="panel-subtitle">
                      Combined temperature, humidity, and smoke level trends
                    </p>
                  </div>
                </div>

                <div className="chart-body">
                  <div className="chart-box">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          name="Temperature"
                          stroke="#38bdf8"
                          strokeWidth={3}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="hum"
                          name="Humidity"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="mq2"
                          name="MQ2 / Smoke"
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="stats-grid" style={{ marginTop: "24px" }}>
                <div className="stat-card">
                  <div>
                    <div className="stat-card-label">Latitude</div>
                    <div className="stat-card-value">
                      <strong>{latestData.lat ?? "N/A"}</strong>
                    </div>
                    <div className="stat-card-trend">Current GPS position</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-card-label">Longitude</div>
                    <div className="stat-card-value">
                      <strong>{latestData.lng ?? "N/A"}</strong>
                    </div>
                    <div className="stat-card-trend">Current GPS position</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-card-label">Last Updated</div>
                    <div className="stat-card-value">
                      <strong style={{ fontSize: "1.2rem" }}>
                        {formatDateTime(latestData.createdAt)}
                      </strong>
                    </div>
                    <div className="stat-card-trend">Latest packet received</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-card-label">Data Points</div>
                    <div className="stat-card-value">
                      <strong>{historyData.length}</strong>
                    </div>
                    <div className="stat-card-trend">Stored historical records</div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;