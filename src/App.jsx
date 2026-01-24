import { useState } from "react";
import "./App.css";

const API_KEY = "df1dac20a6144f94b7151808262401";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Enter a city name");
      return;
    }

    try {
      setError("");
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      );

      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    }
  };

 const theme = () => {
  if (!weather) return "default";
  const t = weather.current.temp_c;
  if (t < 15) return "cold";
  if (t < 30) return "warm";
  return "hot";
};

const weatherEffect = () => {
  if (!weather) return "";
  const text = weather.current.condition.text.toLowerCase();

  if (text.includes("rain") || text.includes("drizzle")) return "rain";
  if (text.includes("snow")) return "snow";
  if (text.includes("sun") || text.includes("clear")) return "sun";
  return "";
};


  return (
    <div className={`screen ${theme()}`}>
      {/* Floating orbs */}
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>
      <div className="orb orb3"></div>

      <div className="glass">
        <h1 className="title">Weather</h1>

        <div className="search">
          <input
            placeholder="Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          />
          <button onClick={fetchWeather}>Go</button>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="info fade-in">
            <h2>{weather.location.name}</h2>
            <div className="temp">{weather.current.temp_c}°</div>
            <p>{weather.current.condition.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
