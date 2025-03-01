import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloud,
  faSun,
  faWind,
  faTint,
  faCompressAlt,
} from "@fortawesome/free-solid-svg-icons";

const Data = () => {
  const API_KEY = "5f8503fb89ffdb650735ce3ffd36d138";
  const [weather, setWeather] = useState(null);
  const [cityInput, setCityInput] = useState("Samarqand,UZ"); // Default Samarqand
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [language, setLanguage] = useState("uz");
  const [loading, setLoading] = useState(false);

  const translations = {
    uz: {
      cityPlaceholder: "Shahar (masalan: Tashkent,UZ)",
      dateLabel: "Sana",
      humidityLabel: "Namlik",
      windLabel: "Shamol",
      pressureLabel: "Bosim",
      errorNoCity: "Shahar kirit!",
      errorCityNotFound: "Shahar topilmadi!",
      errorDataFetch: "Xatolik!",
    },
    en: {
      cityPlaceholder: "City (e.g., London,GB)",
      dateLabel: "Date",
      humidityLabel: "Humidity",
      windLabel: "Wind",
      pressureLabel: "Pressure",
      errorNoCity: "Enter city!",
      errorCityNotFound: "City not found!",
      errorDataFetch: "Error!",
    },
    ru: {
      cityPlaceholder: "Город (напр., Москва,RU)",
      dateLabel: "Дата",
      humidityLabel: "Влажность",
      windLabel: "Ветер",
      pressureLabel: "Давление",
      errorNoCity: "Введите город!",
      errorCityNotFound: "Город не найден!",
      errorDataFetch: "Ошибка!",
    },
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      const filteredSuggestions = data.map((item) => ({
        name: item.name,
        country: item.country,
      }));
      setSuggestions(filteredSuggestions);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const getWeather = async (city = "") => {
    const searchCity = city || cityInput;
    if (!searchCity.trim()) {
      setError(translations[language].errorNoCity);
      return;
    }

    const [cityName, countryCode] = searchCity.split(',').map(item => item.trim());
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}${
      countryCode ? `,${encodeURIComponent(countryCode)}` : ''
    }&appid=${API_KEY}&units=metric`;

    setLoading(true);
    try {
      const res = await fetch(URL);
      const data = await res.json();

      if (data.cod === 200) {
        setWeather(data);
        setError("");
        setSuggestions([]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setWeather(null);
      setError(
        error.message === "city_mismatch"
          ? translations[language].errorCityNotFound
          : translations[language].errorDataFetch
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather("Samarqand,UZ"); // Initial fetch for Samarqand
  }, []);

  useEffect(() => {
    const date = new Date();
    setCurrentDate(
      date.toLocaleDateString(language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
  }, [language]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cityInput) fetchSuggestions(cityInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [cityInput]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cityInput) getWeather();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [cityInput]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCityInput("Samarqand,UZ");
    setWeather(null);
    setSuggestions([]);
    getWeather("Samarqand,UZ");
  };

  const handleSuggestionClick = (suggestion) => {
    const fullCity = `${suggestion.name},${suggestion.country}`;
    setCityInput(fullCity);
    setSuggestions([]);
    getWeather(fullCity);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear": return faSun;
      case "Clouds": return faCloud;
      case "Rain":
      case "Drizzle":
      case "Thunderstorm": return faCloud;
      default: return faCloud;
    }
  };

  const getBackgroundGradient = () => {
    if (!weather?.weather) return "bg-gradient-to-br from-blue-100 to-yellow-200";
    const condition = weather.weather[0].main;
    switch (condition) {
      case "Clear": return "bg-gradient-to-br from-yellow-300 to-orange-400";
      case "Clouds": return "bg-gradient-to-br from-gray-200 to-blue-300";
      case "Rain": return "bg-gradient-to-br from-blue-300 to-indigo-400";
      default: return "bg-gradient-to-br from-blue-100 to-yellow-200";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col p-8 ${getBackgroundGradient()} transition-all duration-1000 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)] pointer-events-none animate-pulse-slow"></div>

      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder={translations[language].cityPlaceholder}
            className="p-3 w-64 rounded-lg bg-white/80 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md transition-all duration-300"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-white/90 border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-2 hover:bg-yellow-100 cursor-pointer text-gray-800 transition-colors duration-200"
                >
                  {suggestion.name}, {suggestion.country}
                </div>
              ))}
            </div>
          )}
        </div>
        <select
          onChange={handleLanguageChange}
          value={language}
          className="p-2 rounded-lg bg-white/80 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md transition-all duration-300"
        >
          <option value="uz">UZ</option>
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center flex-grow">
          <div className="w-12 h-12 border-4 border-t-yellow-400 border-gray-300 rounded-full animate-spin shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 font-semibold p-3 rounded-lg shadow-md animate-bounce">
          {error}
        </div>
      )}

      {/* Weather Cards */}
      {weather && weather.weather && (
        <div className="flex flex-col items-center justify-center flex-grow w-full max-w-4xl mx-auto animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
            <FontAwesomeIcon
              icon={getWeatherIcon(weather.weather[0].main)}
              className="text-4xl text-yellow-500 animate-pulse"
            />
            <span>{weather.name.split(',')[0]}</span>
          </h1>
          <p className="text-gray-600 mb-8">{translations[language].dateLabel}: {currentDate}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Temperature Card */}
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <FontAwesomeIcon icon={faSun} className="text-3xl text-yellow-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">Temperatura</h2>
              <p className="text-2xl text-gray-600">{Math.round(weather.main.temp)} <sup>o</sup>C</p>
            </div>

            {/* Wind Speed Card */}
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <FontAwesomeIcon icon={faWind} className="text-3xl text-blue-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">{translations[language].windLabel}</h2>
              <p className="text-2xl text-gray-600">{weather.wind.speed} m/s</p>
            </div>

            {/* Humidity Card */}
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <FontAwesomeIcon icon={faTint} className="text-3xl text-blue-400 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">{translations[language].humidityLabel}</h2>
              <p className="text-2xl text-gray-600">{weather.main.humidity} %</p>
            </div>

            {/* Pressure Card */}
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <FontAwesomeIcon icon={faCompressAlt} className="text-3xl text-gray-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">{translations[language].pressureLabel}</h2>
              <p className="text-2xl text-gray-600">{weather.main.pressure} hPa</p>
            </div>

            {/* Condition Card */}
            <div className="bg-white/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <FontAwesomeIcon icon={getWeatherIcon(weather.weather[0].main)} className="text-3xl text-gray-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">Holat</h2>
              <p className="text-2xl text-gray-600 capitalize">{weather.weather[0].description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Data;