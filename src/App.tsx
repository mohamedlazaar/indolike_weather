import { useEffect, useState } from "react";
import "./App.css";

interface WeatherData {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
    }>;
  };
}

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [userLocation, setUserLocation] = useState("New York");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to get location name');
      }

      const data = await response.json();
      return {
        name: data.location.name,
      };
    } catch (error) {
      throw new Error('Error getting location name');
    }
  };

  const getLocation = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const locationInfo = await getLocationName(latitude, longitude);
            const locationString: string = locationInfo.name;
            setUserLocation(locationString); // Set the location
            fetchWeatherData(locationString); // Fetch weather data for the new location
          } catch (error) {
            setError('Failed to get location name');
          }
        },
        () => {
          setError('Failed to retrieve your location. Please enable geolocation access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const fetchWeatherData = async (location?: string, e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const locationToFetch = location || userLocation;

    if (!locationToFetch.trim()) {
      setError('Please enter a location');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${locationToFetch}`
      );

      if (!response.ok) {
        throw new Error('Location not found');
      }

      const data = await response.json();
      if (!data || !data.location || !data.current) {
        throw new Error('Invalid data received from the API');
      }

      setWeatherData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="container">
      <div className="search-section">
        <form onSubmit={(e) => fetchWeatherData(undefined, e)} className="search-form">
          <input
            type="search"
            className="search-input"
            placeholder="Enter city name"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
          />
          <button type="submit" className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.4 488.4">
              <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7S381.9,104.65,381.9,203.25z" />
            </svg>
          </button>
        </form>
        <button
          className="location-button"
          onClick={getLocation}
          disabled={isLoading}
        >
          <svg
            className="location-icon"
            viewBox="0 0 395.71 395.71"
            fill="currentColor"
          >
            <path d="M197.849,0C122.131,0,60.531,61.609,60.531,137.329c0,72.887,124.591,243.177,129.896,250.388l4.951,6.738c0.579,0.792,1.501,1.255,2.471,1.255c0.985,0,1.901-0.463,2.486-1.255l4.948-6.738c5.308-7.211,129.896-177.501,129.896-250.388C335.179,61.609,273.569,0,197.849,0z M197.849,88.138c27.13,0,49.191,22.062,49.191,49.191c0,27.115-22.062,49.191-49.191,49.191c-27.114,0-49.191-22.076-49.191-49.191C148.658,110.2,170.734,88.138,197.849,88.138z" />
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {weatherData && !isLoading && (
        <div className="weather-section">
          <div className="weather-info">
            <h2 className="location-name">{weatherData.location.name}</h2>
            <p className="date">
              {weatherData.forecast.forecastday.length > 0
                ? weatherData.forecast.forecastday[0].date
                : 'Date not available'}
            </p>
            <div className="weather-main">
              <img
                src={weatherData.current.condition.icon}
                alt={weatherData.current.condition.text}
                className="weather-icon"
              />
              <div className="weather-plus-info">
                <p className="temperature">{weatherData.current.temp_c.toFixed()}°C</p>
                <p className="condition">{weatherData.current.condition.text}</p>
              </div>
            </div>
            <div className="weather-details">
              <div className="weather-detail-item">
                <p className="detail-label">Humidity</p>
                <p className="detail-value">{weatherData.current.humidity}%</p>
              </div>
              <div className="weather-detail-item">
                <p className="detail-label">Wind Speed</p>
                <p className="detail-value">{weatherData.current.wind_kph} km/h</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;