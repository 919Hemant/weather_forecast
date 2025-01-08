const cityInput = document.querySelector("#city-name");
const apikey = '7831e95fb5fb6c6e7cc737153bacd95a';

const cityHead = document.querySelector(".city-head");
const dateHead = document.querySelector(".date");
const temperatureRating = document.querySelector(".temperature-rating");
const temperatureMessage = document.querySelector("#temperature-message");
const humidity = document.querySelector(".humidity");
const windSpeed = document.querySelector(".wind-speed");
const feelsLike = document.querySelector("#feels-like");
const imageSource = document.querySelector("#image-source");
const weatherIcon = document.querySelector('#weather-icon'); 

const recentCitiesDropdown = document.querySelector("#recent-cities");

const MAX_RECENT_CITIES = 5;

const searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click", handleSearch);

const locationButton = document.querySelector("#location-button");
locationButton.addEventListener("click", handleLocationSearch);

// Function to handle city search
async function handleSearch() {
    const city = cityInput.value.trim();
    if (city === '') {
        alert("Please enter a valid city name");
        return;
    }
    const result = await getWeather(city);
    if (result && result.list && result.list.length > 0 && result.city && result.city.name.toLowerCase() === city.toLowerCase()) {
        updateWeather(result, city);
        addCityToRecent(city);
    } else {
        alert("City not found. Please enter a valid city name.");
    }
    cityInput.value = '';
}

// Function to handle geolocation search
async function handleLocationSearch() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const result = await getWeatherByCoordinates(latitude, longitude);
            if (result && result.list && result.list.length > 0 && result.city) {
                updateWeather(result, result.city.name);
            } else {
                alert("Unable to fetch weather for your location.");
            }
        }, () => {
            alert("Permission denied for geolocation");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to get weather data by city name
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.list || data.list.length === 0 || !data.city) {
            return null;
        }
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}

// Function to get weather data by coordinates
async function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.list || data.list.length === 0 || !data.city) {
            return null;
        }
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}

// Function to get the appropriate weather icon
function getWeatherIcon(weatherCode) {
    const weatherIcons = {
        '01d': 'clear-sky.png',
        '01n': 'clear-sky.png',
        '02d': 'few-clouds.png',
        '02n': 'few-clouds.png',
        '03d': 'scattered-clouds.png',
        '03n': 'scattered-clouds.png',
        '04d': 'cloudy.png',
        '04n': 'cloudy.png',
        '09d': 'heavy-rain.png',
        '09n': 'heavy-rain.png',
        '10d': 'rain.png',
        '10n': 'rain-night.png',
        '11d': 'thunderstorm.png',
        '11n': 'thunderstorm.png',
        '13d': 'snow.png',
        '13n': 'snow.png',
        '50d': 'mist.png',
        '50n': 'mist.png'
    };

    return weatherIcons[weatherCode] || 'unknown.png';
}

// Function to update weather display
function updateWeather(result, cityName) {
    if (!result) {
        alert("No weather data available");
        return;
    }

    // Update current weather
    cityHead.textContent = cityName;
    const currentDate = new Date(result.list[0].dt * 1000);
    dateHead.textContent = currentDate.toLocaleDateString();
    temperatureRating.textContent = Math.round(result.list[0].main.temp);
    temperatureMessage.textContent = result.list[0].weather[0].description;
    feelsLike.textContent = Math.round(result.list[0].main.feels_like);
    windSpeed.textContent = result.list[0].wind.speed;
    humidity.textContent = result.list[0].main.humidity;

    const iconCode = result.list[0].weather[0].icon;
    weatherIcon.src = `images/${getWeatherIcon(iconCode)}`; // Updated icon code
    weatherIcon.alt = result.list[0].weather[0].description;


    // Update 5-day forecast
    updateForecast(result.list);
}

// Function to update 5-day forecast
function updateForecast(forecastList) {
    const forecastContainer = document.querySelector('.forecast-list');
    forecastContainer.innerHTML = ''; 

    // Get one forecast per day 
    const dailyForecasts = forecastList.filter((_, index) => index % 8 === 0).slice(1, 6);

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const iconCode = forecast.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="images/${getWeatherIcon(iconCode)}" alt="${forecast.weather[0].description}" class="forecast-icon">
            <p class="temp-forecast">${temp}°C</p>
            <p>${forecast.weather[0].description}</p>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

// Function to add city to recent searches
function addCityToRecent(city) {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
    recentCities.unshift(city);
    if (recentCities.length > MAX_RECENT_CITIES) {
        recentCities.pop();
    }
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
}

// Function to update recent cities dropdown
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCitiesDropdown.innerHTML = '<option value="">Recent Searches</option>';
    if (recentCities.length > 0) {
        recentCitiesDropdown.style.display = 'block';
        recentCities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            recentCitiesDropdown.appendChild(option);
        });
    } else {
        recentCitiesDropdown.style.display = 'none';
    }
}

// Event listener for recent cities dropdown
recentCitiesDropdown.addEventListener("change", async () => {
    const selectedCity = recentCitiesDropdown.value;
    if (selectedCity) {
        const result = await getWeather(selectedCity);
        if (result && result.list && result.list.length > 0 && result.city) {
            updateWeather(result, selectedCity);
        } else {
            alert("Unable to fetch weather for the selected city.");
        }
    }
});

// Load weather for default city on page load
window.addEventListener("load", async () => {
    const defaultCity = "JAIPUR"; 
    const result = await getWeather(defaultCity);
    if (result && result.list && result.list.length > 0 && result.city) {
        updateWeather(result, defaultCity);
    } else {
        alert("Unable to fetch weather for the default city.");
    }
    updateRecentCitiesDropdown();
});

