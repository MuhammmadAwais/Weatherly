document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURATION & DOM SELECTION ---
  const API_KEY = "057788ae0bd9dc62ca5c46548e59ba50"; // Using the valid key you provided.

  // Input Elements
  const cityInput = document.getElementById("CityName");
  const searchButton = document.getElementById("SearchButton");

  // Display Containers & Indicators
  const loadingIndicator = document.getElementById("loading-indicator");
  const messageBox = document.getElementById("message-box");
  const messageText = document.getElementById("message-text");
  const weatherDisplay = document.getElementById("WeatherDisplay");

  // Current Weather Elements
  const currentDayEl = document.getElementById("current-day");
  const currentDateEl = document.getElementById("current-date");
  const currentLocationEl = document.getElementById("current-location");
  const currentWeatherIconEl = document.getElementById("current-weather-icon");
  const currentTempEl = document.getElementById("current-temp");
  const currentConditionEl = document.getElementById("current-condition");

  // Forecast Elements
  const forecastGrid = document.querySelector(".forecast-grid");

  // --- 2. UI MANIPULATION FUNCTIONS ---

  /**
   * Toggles the visibility of the loading indicator and main content.
   * @param {boolean} isLoading - True to show loading, false to show content.
   */
  const toggleLoading = (isLoading) => {
    loadingIndicator.style.display = isLoading ? "flex" : "none";
    weatherDisplay.style.display = isLoading ? "none" : "flex";
  };

  /**
   * Displays a message to the user in the custom message box.
   * @param {string} message - The message to display.
   */
  const showMessage = (message) => {
    // Capitalize the first letter for a cleaner look
    const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    messageText.textContent = formattedMessage;
    messageBox.style.display = "block";
    toggleLoading(false); // Ensure loader is hidden when message appears
  };

  /**
   * Updates the UI with the current weather data.
   * @param {object} data - The current weather data from the API.
   */
  const updateCurrentWeather = (data) => {
    const date = new Date(data.dt * 1000);

    currentDayEl.textContent = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    currentDateEl.textContent = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase();
    currentLocationEl.textContent = `${data.name}, ${data.sys.country}`;
    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    currentTempEl.textContent = `${Math.round(data.main.temp)}°C`;
    currentConditionEl.textContent = data.weather[0].main.toUpperCase();
  };

  /**
   * Updates the UI with the 4-day forecast data.
   * @param {object} data - The forecast data from the API.
   */
  const updateForecast = (data) => {
    forecastGrid.innerHTML = ""; // Clear previous forecast items

    // Filter to get one forecast per day for the next 4 days (at noon)
    const dailyForecasts = data.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 4);

    dailyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const temp = Math.round(forecast.main.temp); // Using the noon temp for simplicity

      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";

      // Note: The free forecast API doesn't provide daily min/max easily.
      // We are showing the temperature at noon for each day.
      forecastItem.innerHTML = `
        <span class="forecast-day">${day}</span>
        <img
          src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png"
          alt="${forecast.weather[0].description}"
          class="forecast-icon"
        />
        <span class="forecast-temps">${temp}°C</span>
      `;
      forecastGrid.appendChild(forecastItem);
    });
  };

  // --- 3. API & DATA HANDLING ---

  /**
   * Fetches and displays all weather data for a given city.
   * @param {string} city - The name of the city.
   */
  async function fetchWeather(city) {
    toggleLoading(true);

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
      // Fetch both endpoints at the same time
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl),
      ]);

      // Check both responses for errors
      if (!currentResponse.ok || !forecastResponse.ok) {
        const errorData = await (currentResponse.ok ? forecastResponse.json() : currentResponse.json());
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
      // Hide loader only if a message box isn't already showing
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

  // Load weather for Rawalpindi on page load
  fetchWeather("Rawalpindi");
});