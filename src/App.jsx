import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  MapPin, 
  Wind, 
  Droplets, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Thermometer,
  Eye,
  Navigation,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const API_KEY = "df1dac20a6144f94b7151808262401";

const BACKGROUNDS = {
  cold: "linear-gradient(to bottom right, #0ea5e9, #e0f2fe)",
  mild: "linear-gradient(to bottom right, #38bdf8, #818cf8)",
  warm: "linear-gradient(to bottom right, #f59e0b, #fb923c)",
  hot: "linear-gradient(to bottom right, #ef4444, #991b1b)",
  night: "linear-gradient(to bottom right, #1e293b, #0f172a)",
  default: "linear-gradient(to bottom right, #1e293b, #0f172a)"
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState("C");

  const fetchData = useCallback(async (query) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=yes`
      );
      if (!res.ok) throw new Error("Location not found");
      const data = await res.json();
      setWeather(data);
      setRecentSearches(prev => [data.location.name, ...prev.filter(s => s !== data.location.name)].slice(0, 3));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchData(`${pos.coords.latitude},${pos.coords.longitude}`),
          () => fetchData("London")
        );
      } else {
        fetchData("London");
      }
    };
    init();
  }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) fetchData(city);
  };

  const getTheme = () => {
    if (!weather) return "default";
    const temp = weather.current.temp_c;
    const isDay = weather.current.is_day;
    if (!isDay && temp < 25) return "night";
    if (temp < 10) return "cold";
    if (temp >= 10 && temp < 25) return "mild";
    if (temp >= 25 && temp <= 35) return "warm";
    if (temp > 35) return "hot";
    return "mild";
  };

  const getBg = () => {
    if (!weather) return BACKGROUNDS.default;
    const temp = weather.current.temp_c;
    const isDay = weather.current.is_day;

    if (!isDay && temp < 25) return BACKGROUNDS.night;
    
    if (temp < 10) return BACKGROUNDS.cold;
    if (temp >= 10 && temp < 25) return BACKGROUNDS.mild;
    if (temp >= 25 && temp <= 35) return BACKGROUNDS.warm;
    if (temp > 35) return BACKGROUNDS.hot;
    
    return BACKGROUNDS.mild;
  };

  return (
    <div className="app-container" style={{ background: getBg() }} data-theme={getTheme()}>
      <div className="bg-overlay"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      <main className="main-content">
        <header className="header animate-fade-in">
          <div className="search-section">
            <div className="search-container">
              <form onSubmit={handleSearch}>
                <Search className="search-icon" size={18} />
                <input 
                  className="search-input" 
                  placeholder="City name..." 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </form>
            </div>
            {recentSearches.length > 0 && (
              <div className="recent-searches">
                {recentSearches.map((s, i) => (
                  <button key={i} className="recent-tag" onClick={() => fetchData(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button className="unit-toggle" onClick={() => setUnit(u => u === "C" ? "F" : "C")}>°{unit}</button>
            <button className="location-btn" onClick={() => navigator.geolocation.getCurrentPosition(p => fetchData(`${p.coords.latitude},${p.coords.longitude}`))}>
              <MapPin size={16} /> Detect
            </button>
          </div>
        </header>

        {loading && <div className="loading-indicator">Updating weather...</div>}
        {error && <div className="error-msg">{error}</div>}

        <AnimatePresence mode="wait">
          {weather && (
            <motion.div 
              key={weather.location.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Main Info */}
              <div className="current-weather-card glass-effect glass-card">
                <div className="weather-header">
                  <h2>{weather.location.name}</h2>
                  <p style={{ opacity: 0.7 }}>{new Date(weather.location.localtime).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>
                <img src={weather.current.condition.icon} alt="icon" width={100} />
                <div className="temp-large">{Math.round(unit === "C" ? weather.current.temp_c : weather.current.temp_f)}°</div>
                <div className="condition-text">{weather.current.condition.text}</div>
                <div style={{ display: 'flex', gap: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
                  <span>H: {Math.round(unit === "C" ? weather.forecast.forecastday[0].day.maxtemp_c : weather.forecast.forecastday[0].day.maxtemp_f)}°</span>
                  <span>L: {Math.round(unit === "C" ? weather.forecast.forecastday[0].day.mintemp_c : weather.forecast.forecastday[0].day.mintemp_f)}°</span>
                </div>
              </div>

              {/* Hourly Forecast */}
              <section className="forecast-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3>Hourly Forecast</h3>
                <div className="hourly-scroll">
                  {weather.forecast.forecastday[0].hour.filter((_, i) => i % 3 === 0).map((h, i) => (
                    <div key={i} className="hourly-item">
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(h.time).getHours()}:00</span>
                      <img src={h.condition.icon} alt="h" width={30} />
                      <span style={{ fontWeight: 600 }}>{Math.round(unit === "C" ? h.temp_c : h.temp_f)}°</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card glass-effect glass-card">
                  <div className="metric-header"><Wind size={14} /> Wind</div>
                  <div className="metric-value">{weather.current.wind_kph} <small>km/h</small></div>
                </div>
                <div className="metric-card glass-effect glass-card">
                  <div className="metric-header"><Droplets size={14} /> Humidity</div>
                  <div className="metric-value">{weather.current.humidity}%</div>
                </div>
                <div className="metric-card glass-effect glass-card">
                  <div className="metric-header"><Sun size={14} /> UV Index</div>
                  <div className="metric-value">{weather.current.uv}</div>
                </div>
                <div className="metric-card glass-effect glass-card">
                  <div className="metric-header"><Activity size={14} /> AQI</div>
                  <div className="metric-value">{Math.round(weather.current.air_quality.pm2_5)}</div>
                </div>
              </div>

              {/* 7-Day List */}
              <section className="forecast-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3>7-Day Forecast</h3>
                <div className="daily-list">
                  {weather.forecast.forecastday.map((day, i) => (
                    <div key={i} className="daily-item">
                      <span style={{ minWidth: '40px' }}>{i === 0 ? 'Today' : new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                      <img src={day.day.condition.icon} alt="d" width={30} />
                      <div style={{ fontWeight: 600 }}>
                        <span style={{ marginRight: '0.5rem' }}>{Math.round(unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f)}°</span>
                        <span style={{ opacity: 0.5 }}>{Math.round(unit === "C" ? day.day.mintemp_c : day.day.mintemp_f)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
