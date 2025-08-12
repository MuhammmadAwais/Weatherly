document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURATION & DOM SELECTION ---
  const API_KEY = "057788ae0bd9dc62ca5c46548e59ba50";

  // Page Elements
  const bodyEl = document.body; // ✅ FIX: Select the body element

  // Input Elements
  const cityInput = document.getElementById("CityName");
  const searchButton = document.getElementById("SearchButton");

  // Display Containers & Indicators
  const loadingIndicator = document.getElementById("loading-indicator");
  const messageBox = document.getElementById("message-box");
  const messageText = document.getElementById("message-text");
  const weatherDisplay = document.getElementById("WeatherDisplay");

  // Current Weather Elements
  const currentWeatherCardEl = document.getElementById("CurrentWeatherCard");
  const currentDayEl = document.getElementById("current-day");
  const currentDateEl = document.getElementById("current-date");
  const currentLocationEl = document.getElementById("current-location");
  const currentWeatherIconEl = document.getElementById("current-weather-icon");
  const currentTempEl = document.getElementById("current-temp");
  const currentConditionEl = document.getElementById("current-condition");

  // Forecast Elements
  const forecastGrid = document.querySelector(".forecast-grid");

  // --- 2. UI MANIPULATION FUNCTIONS ---

  const toggleLoading = (isLoading) => {
    loadingIndicator.style.display = isLoading ? "flex" : "none";
    weatherDisplay.style.display = isLoading ? "none" : "flex";
  };

  const showMessage = (message) => {
    const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    messageText.textContent = formattedMessage;
    messageBox.style.display = "block";
    toggleLoading(false);
  };

  const updateCurrentWeather = (data) => {
    const date = new Date(data.dt * 1000);
    const weatherCondition = data.weather[0].main.toUpperCase();

    // Update text and icon elements
    currentDayEl.textContent = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    currentDateEl.textContent = date
      .toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
    currentLocationEl.textContent = `${data.name}, ${data.sys.country}`;
    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    currentTempEl.textContent = `${Math.round(data.main.temp)}°C`;
    currentConditionEl.textContent = weatherCondition;

    // --- Background Changer Logic ---
    const overlay = "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),";

    // ✅ FIX: Changed 'body' to 'bodyEl' in all lines below
    if (weatherCondition === "CLOUDS") {
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-clouds.jpeg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-clouds.jpg")`;
    } else if (weatherCondition === "RAIN") {
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-rain.jpeg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-rain.jpg")`;
    } else if (weatherCondition === "THUNDERSTORM") {
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-thunderstorm.jpeg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-thunderstorm.jpg")`;
    } else if (weatherCondition === "SNOW") {
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-snow.jpeg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-snow.jpg")`;
    } else if (weatherCondition === "DRIZZLE") {
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-drizzle.jpg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-drizzle.jpg")`;
    } else if (weatherCondition === "CLEAR") {
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-clear.jpeg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-clear.jpg")`;
    } else if (
      weatherCondition === "MIST" ||
      weatherCondition === "FOG" ||
      weatherCondition === "HAZE"
    ) {
      // Grouping atmosphere conditions
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-atmosphere.jpg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-atmosphere.jpg")`;
    } else {
      // Reset to the default background for all other weather conditions
      currentWeatherCardEl.style.backgroundImage = `${overlay} url("wc-default.jpeg")`;
      bodyEl.style.backgroundImage = `${overlay} url("bb-default.jpg")`;
    }
  };

  const updateForecast = (data) => {
    forecastGrid.innerHTML = "";
    const dailyForecasts = data.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 4);

    dailyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      const temp = Math.round(forecast.main.temp);
      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";
      forecastItem.innerHTML = `
        <span class="forecast-day">${day}</span>
        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}" class="forecast-icon" />
        <span class="forecast-temps">${temp}°C</span>
      `;
      forecastGrid.appendChild(forecastItem);
    });
  };

  // --- 3. API & DATA HANDLING ---
  async function fetchWeather(city) {
    toggleLoading(true);
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl),
      ]);
      if (!currentResponse.ok || !forecastResponse.ok) {
        const errorData = await (currentResponse.ok
          ? forecastResponse.json()
          : currentResponse.json());
        throw new Error(errorData.message || "An error occurred.");
      }
      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      updateCurrentWeather(currentData);
      updateForecast(forecastData);
    } catch (error) {
      console.error("Fetch Error:", error);
      showMessage(error.message);
    } finally {
      if (messageBox.style.display !== "block") {
        toggleLoading(false);
      }
    }
  }

  // --- 4. EVENT LISTENERS ---
  searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    } else {
      showMessage("Please enter a city name.");
    }
  });

  cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) {
        fetchWeather(city);
      } else {
        showMessage("Please enter a city name.");
      }
    }
  });

  // --- 5. INITIALIZATION ---
  fetchWeather("Rawalpindi");
});
