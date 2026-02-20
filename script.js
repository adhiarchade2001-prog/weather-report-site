// =========================================================================
// PROJECT: DYNAMIC WEATHER DASHBOARD
// FINAL VERSION with 5-Day Forecast, Simple Summary Text, Custom Icons, 
// and Personalized Weather Advice.
// =========================================================================

const API_KEY = 'ba423582d449656e7dada86a9c5c8615'; 
const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// 1. Get references to key HTML elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const errorMessage = document.getElementById('error-message');
const forecastContainer = document.getElementById('forecast-container');
const summaryContainer = document.getElementById('forecast-summary-container'); 
const adviceBox = document.getElementById('advice-box'); // New reference for advice box

// 2. Add event listeners for button click and Enter key press
searchButton.addEventListener('click', fetchCityWeatherFromInput);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchCityWeatherFromInput();
    }
});

function fetchCityWeatherFromInput() {
    const city = cityInput.value.trim();
    if (city) {
        // Clear old display data before fetching new data
        forecastContainer.innerHTML = '';
        clearForecastSummary(); 
        clearWeatherAdvice();
        
        // Fetch both current and forecast data
        fetchWeatherData(city);
        fetchForecastData(city);
    } else {
        alert('Please enter a city name.');
    }
}

// =========================================================================
// 3. ICON MAPPING FUNCTION: Maps OWM Codes to Font Awesome Classes
// =========================================================================
function getWeatherIconClass(iconCode) {
    switch (iconCode) {
        case '01d': // Clear sky (day)
            return { icon: 'fa-sun', color: 'text-warning' }; 
        case '01n': // Clear sky (night)
            return { icon: 'fa-moon', color: 'text-info' }; 
        case '02d': // Few clouds (day)
            return { icon: 'fa-cloud-sun', color: 'text-warning' }; 
        case '02n': // Few clouds (night)
            return { icon: 'fa-cloud-moon', color: 'text-info' };
        case '03d':
        case '03n': // Scattered clouds
            return { icon: 'fa-cloud', color: 'text-secondary' };
        case '04d':
        case '04n': // Broken clouds
            return { icon: 'fa-cloud-meatball', color: 'text-secondary' }; 
        case '09d':
        case '09n': // Shower rain
            return { icon: 'fa-cloud-showers-heavy', color: 'text-primary' }; 
        case '10d': // Rain (day)
            return { icon: 'fa-cloud-sun-rain', color: 'text-primary' };
        case '10n': // Rain (night)
            return { icon: 'fa-cloud-moon-rain', color: 'text-primary' };
        case '11d':
        case '11n': // Thunderstorm
            return { icon: 'fa-bolt', color: 'text-danger' }; 
        case '13d':
        case '13n': // Snow
            return { icon: 'fa-snowflake', color: 'text-white' };
        case '50d':
        case '50n': // Mist/Fog
            return { icon: 'fa-smog', color: 'text-muted' };
        default:
            return { icon: 'fa-question-circle', color: 'text-secondary' };
    }
}

// =========================================================================
// 4. NEW FUNCTION: Generate Personalized Advice
// =========================================================================
// Function to generate personalized advice based on current conditions
function generateWeatherAdvice(data) {
    const temp = data.main.temp;
    const weatherMain = data.weather[0].main;
    const cityName = data.name;

    let adviceText = '';
    let adviceClass = ''; // For styling the Bootstrap alert box

    // Define the list of conditions that require an umbrella/protection
    const WET_CONDITIONS = ['Rain', 'Drizzle', 'Thunderstorm', 'Snow', 'Squall', 'Tornado'];
    
    // Define the temperature thresholds
    const HIGH_HEAT_THRESHOLD = 35; // 35°C for sunscreen warning
    const MODERATE_TEMP_MIN = 20;   // 15°C for "enjoy the weather" advice

    // 1. Rainy/Snow/Wet Condition Check
    if (WET_CONDITIONS.includes(weatherMain)) {
        adviceText = `It looks like ${weatherMain.toLowerCase()} in ${cityName}! Please take an umbrella and wear waterproof shoes while going outside.`;
        adviceClass = 'alert-primary'; // Blue background for caution
    } 
    // 2. High Heat Condition Check
    else if (temp >= HIGH_HEAT_THRESHOLD) {
        adviceText = `The temperature in ${cityName} is very high (${temp.toFixed(1)}°C)! Don't forget to put sunscreen and stay hydrated while going out.`;
        adviceClass = 'alert-danger'; // Red background for heat warning
    } 
    // 3. Normal/Moderate Condition (Clear and comfortable temperature)
    else if (temp >= MODERATE_TEMP_MIN && temp < HIGH_HEAT_THRESHOLD && (weatherMain === 'Clear' || weatherMain === 'Clouds' || weatherMain === 'Mist' || weatherMain === 'Haze')) {
        adviceText = `The weather in ${cityName} is great today! Not too much rain or heat. Enjoy and roam around the city!`;
        adviceClass = 'alert-success'; // Green background for good news
    }
    // Default fallback for unlisted conditions (e.g., Extreme, Dust, Ash, or cold temps below 15C)
    else {
        adviceText = `Check the current conditions in ${cityName} to plan your day. Specific advisories are currently not applicable.`;
        adviceClass = 'alert-info';
    }

    return `<div class="alert ${adviceClass}" role="alert">${adviceText}</div>`;
}

// 5. Function to fetch CURRENT weather data
async function fetchWeatherData(city) {
    const url = `${CURRENT_URL}?q=${city}&appid=${API_KEY}&units=metric`; 

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        errorMessage.classList.add('d-none');
        displayWeatherData(data);

    } catch (error) {
        console.error('Fetch current weather error:', error);
        errorMessage.classList.remove('d-none');
        clearWeatherData(); 
    }
}

// 6. Function to update the HTML with the fetched CURRENT data
function displayWeatherData(data) {
    const temp = data.main.temp.toFixed(1);
    const feelsLike = data.main.feels_like.toFixed(1);
    const description = data.weather[0].description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    const iconCode = data.weather[0].icon; 
    const { icon, color } = getWeatherIconClass(iconCode); 
    
    const dateTime = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('city-name').textContent = data.name + ", " + data.sys.country;
    document.getElementById('date-time').textContent = dateTime;
    document.getElementById('temperature').textContent = temp;
    document.getElementById('description').textContent = description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('feels-like').textContent = `${feelsLike}°C`;
    
    document.getElementById('icon-container').innerHTML = 
        `<i class="fa-solid ${icon} fa-5x ${color}"></i>`;

    // *** INSERT THE NEW ADVICE MESSAGE ***
    if (adviceBox) {
        adviceBox.innerHTML = generateWeatherAdvice(data);
    }
}


// 7. Function to fetch FORECAST weather data
async function fetchForecastData(city) {
    const url = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        displayForecastData(data);

    } catch (error) {
        console.error('Fetch forecast weather error:', error);
        forecastContainer.innerHTML = '<p class="text-white text-center">Could not load forecast data.</p>';
    }
}

// 8. Function to process and display the 5-day forecast
function displayForecastData(data) {
    forecastContainer.innerHTML = ''; 
    clearForecastSummary(); 
    
    const dailyForecasts = {};
    const today = new Date().toDateString();
    
    let allTemps = [];
    let conditionCounts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (date === today) return; 

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = { 
                temps: [], 
                iconCode: item.weather[0].icon,
                description: item.weather[0].description 
            };
        }
        
        dailyForecasts[date].temps.push(item.main.temp);
        allTemps.push(item.main.temp);
        
        const mainCondition = item.weather[0].main;
        conditionCounts[mainCondition] = (conditionCounts[mainCondition] || 0) + 1;
    });

    const nextFiveDays = Object.keys(dailyForecasts).slice(0, 5); 
    
    // =========================================================================
    // FORECAST SUMMARY GENERATION
    // =========================================================================
    if (allTemps.length > 0 && summaryContainer) { 
        const overallMax = Math.max(...allTemps).toFixed(1);
        const overallMin = Math.min(...allTemps).toFixed(1);
        
        let mostFrequentCondition = '';
        let maxCount = 0;
        for (const condition in conditionCounts) {
            if (conditionCounts[condition] > maxCount) {
                maxCount = conditionCounts[condition];
                mostFrequentCondition = condition;
            }
        }
        
        const mainConditionTitle = mostFrequentCondition.charAt(0).toUpperCase() + mostFrequentCondition.slice(1);
        
        // 3. Construct the summary paragraph with basic, direct English
        const summaryText = `
            For the next ${nextFiveDays.length} days, the highest temperature will be ${overallMax}°C and the lowest temperature will be ${overallMin}°C. The weather forecast shows a high chance of ${mainConditionTitle}
            during this period. Find daily details in the cards below.
        `;
        
        // 4. Insert the text directly into the reliable container
        summaryContainer.innerHTML = `<p class="text-center text-white lead mb-4 fw-light">${summaryText}</p>`;
    }
    // =========================================================================


    // Loop to generate 5-day forecast cards
    nextFiveDays.forEach(dateStr => {
        const dailyData = dailyForecasts[dateStr];
        
        const maxTemp = Math.max(...dailyData.temps).toFixed(1);
        const minTemp = Math.min(...dailyData.temps).toFixed(1);
        const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
        
        const description = dailyData.description
             .split(' ')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
             .join(' ');
             
        const { icon, color } = getWeatherIconClass(dailyData.iconCode);

        const cardHtml = `
            <div class="col-6 col-sm-4 col-md-2 mb-4">
                <div class="card weather-card text-center shadow">
                    <div class="card-body p-2">
                        <h6 class="card-title fw-bold">${dayName}</h6>
                        <p class="card-subtitle mb-1 small text-muted">${new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        
                        <i class="fa-solid ${icon} fa-3x ${color}"></i>
                        
                        <p class="small mb-2">${description}</p>
                        <div class="mt-1">
                            <span class="fw-bold text-danger me-1">${maxTemp}°C</span>
                            <span class="text-info">${minTemp}°C</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// 9. Helper functions for clearing elements
function clearForecastSummary() {
    const summaryContainer = document.getElementById('forecast-summary-container');
    if (summaryContainer) {
        summaryContainer.innerHTML = '';
    }
}

function clearWeatherAdvice() {
    if (adviceBox) {
        adviceBox.innerHTML = '';
    }
}

// 10. Function to clear ALL data on error
function clearWeatherData() {
    document.getElementById('city-name').textContent = 'Error';
    document.getElementById('date-time').textContent = '---';
    document.getElementById('temperature').textContent = '--';
    document.getElementById('description').textContent = 'Data not available. Check spelling or try another city.';
    document.getElementById('humidity').textContent = '--%';
    document.getElementById('wind-speed').textContent = '-- km/h';
    document.getElementById('feels-like').textContent = '--°C';
    document.getElementById('icon-container').innerHTML = '<i class="fas fa-exclamation-triangle fa-5x text-danger"></i>'; 
    forecastContainer.innerHTML = '';
    
    // Clear all helper elements
    clearForecastSummary();
    clearWeatherAdvice();
}
// =========================================================================
// NEW: VOICE SEARCH LOGIC
// =========================================================================

const voiceBtn = document.getElementById('voice-search-btn');

// Check if browser supports Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    // When the user clicks the mic
    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.classList.add('recording'); // Start pulse animation
    });

  

    // When voice is successfully recognized
    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        
        // NEW: Clean the transcript
        // 1. Remove the period at the end if it exists
        // 2. Remove any trailing spaces
        transcript = transcript.replace(/\./g, '').trim();
        
        cityInput.value = transcript; // Put cleaned result into input box
        voiceBtn.classList.remove('recording'); // Stop animation
        
        // Trigger the search automatically
        fetchCityWeatherFromInput(); 
    }

    // Handle errors or stopping
    recognition.onspeechend = () => {
        recognition.stop();
        voiceBtn.classList.remove('recording');
    };

    recognition.onerror = (event) => {
        voiceBtn.classList.remove('recording');
        console.error("Speech recognition error: " + event.error);
        if(event.error === 'not-allowed') {
            alert("Please allow microphone access to use voice search.");
        }
    };

} else {
    // If browser doesn't support it (like some older versions)
    voiceBtn.style.display = 'none';
    console.log("Speech Recognition not supported in this browser.");
}
;


