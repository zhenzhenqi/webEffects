// --- Replace with your API Key and Location (for the weather part) ---
const API_KEY = "847fc9174bc5b89cb32ea8608e4cdcba"; // !!! Replace with your key !!!
const CITY_NAME = "Storrs"; // Replace with the city you want
const COUNTRY_CODE = "US"; // Optional, helps disambiguate cities
// --- End Configuration ---

const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME},${COUNTRY_CODE}&appid=${API_KEY}&units=metric`; // Use 'imperial' for Fahrenheit

let weatherData = null; // Variable to hold weather data
let temperature = 0;
let weatherDescription = "";
let weatherId = 0; // OpenWeatherMap weather ID
let feelsLikeTemperature = 0;
let humidity = 0;
let cloudiness = 0;
let sunriseTime = "";
let sunsetTime = "";

// --- Sentences for the H1 ---
const sentences = [
    "Have a miaodaful day",
    "The sun is shining somewhere",
    "Stay cloudy",
    "go with the wind, or sun, or rain, or miao",
    "Greetings from the clouds"
];
// --- End Sentences ---

// --- List of your GIF filenames ---
// IMPORTANT: Update this array manually to match the files in your 'gifs' folder
const gifFilenames = [
    "cat.gif",
    "cat1.gif",
    "cat2.gif",
    "cat3.gif",
    "cat4.gif",
    "cat5.gif"
    // Add the names of all your GIF files here
];
// --- End GIF List ---


// Add an event listener to wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- Random Sentence Logic (existing) ---
    const headingElement = document.getElementById('random-sentence-heading');
    if (headingElement) {
        const randomIndexSentence = Math.floor(Math.random() * sentences.length);
        const randomSentence = sentences[randomIndexSentence];
        headingElement.textContent = randomSentence;
    } else {
        console.error("H1 element with ID 'random-sentence-heading' not found.");
    }
    // --- End Random Sentence Logic ---

    // --- Random GIF Logic (new) ---
    const gifElement = document.getElementById('random-gif');

    if (gifElement && gifFilenames.length > 0) {
        // Select a random GIF filename from the array
        const randomIndexGif = Math.floor(Math.random() * gifFilenames.length);
        const randomGifFilename = gifFilenames[randomIndexGif];

        // Construct the path to the GIF file
        const gifPath = `gifs/${randomGifFilename}`; // Assumes gifs folder is in the same directory as popup.html

        // Set the src attribute of the img tag
        gifElement.src = gifPath;
    } else if (gifFilenames.length === 0) {
        console.warn("No GIF filenames listed in the 'gifFilenames' array.");
        if (gifElement) gifElement.style.display = 'none'; // Hide the img tag if no gifs
    }
    else {
        console.error("IMG element with ID 'random-gif' not found.");
    }
    // --- End Random GIF Logic ---
});


// p5.js preload function (optional, but good for loading data before setup)
function preload() {
    // Fetch weather data asynchronously
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            weatherData = data;
            console.log("Weather data loaded:", weatherData);
            if (weatherData && weatherData.main && weatherData.weather && weatherData.weather.length > 0) {
                temperature = weatherData.main.temp;
                weatherDescription = weatherData.weather[0].description;
                weatherId = weatherData.weather[0].id;

                feelsLikeTemperature = weatherData.main.feels_like;
                humidity = weatherData.main.humidity;
                cloudiness = weatherData.clouds.all;

                if (weatherData.sys && weatherData.sys.sunrise && weatherData.sys.sunset) {
                    sunriseTime = convertUnixToTime(weatherData.sys.sunrise);
                    sunsetTime = convertUnixToTime(weatherData.sys.sunset);
                }

                console.log(`Temp: ${temperature}°C, Feels Like: ${feelsLikeTemperature}°C, Humidity: ${humidity}%, Cloudiness: ${cloudiness}%, Sunrise: ${sunriseTime}, Sunset: ${sunsetTime}, Desc: ${weatherDescription}, ID: ${weatherId}`);


            } else {
                console.error("Invalid weather data format:", weatherData);
                weatherDescription = "Error loading data";
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            weatherDescription = "Error fetching data";
            if (error.message.includes("401")) {
                console.error("Possible invalid API key!");
            }
        });
}

// Function to convert Unix timestamp to HH:MM format
function convertUnixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes}`;
}


// p5.js setup function
function setup() {
    const canvas = createCanvas(300, 250); // Adjusted size
    canvas.parent('p5-container'); // Attach canvas to the div

    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
}

// p5.js draw function - runs continuously
function draw() {
    let bgColor = map(temperature, -10, 30, 100, 220);
    background(bgColor);

    if (weatherData) {
        let weatherGroup = floor(weatherId / 100);

        // Basic visual representation (can be expanded)
        if (weatherId === 800) { // Clear sky
            fill(255, 204, 0); // Yellow sun
            ellipse(width * 0.75, height * 0.2, 40, 40);
        } else if (weatherGroup === 8) { // Clouds (801-804)
            fill(200); // Grey color for clouds
            ellipse(width * 0.3, height * 0.25, 35, 25);
            ellipse(width * 0.5, height * 0.3, 45, 30);
            ellipse(width * 0.7, height * 0.28, 40, 28);
        } else if (weatherGroup === 5) { // Rain
            fill(100, 150, 255); // Blue color for rain
            for (let i = 0; i < 15; i++) {
                let x = random(width);
                let y = random(height * 0.6); // Rain in upper part
                line(x, y, x + 3, y + 10);
            }
        } else if (weatherGroup === 6) { // Snow
            fill(255); // White color for snow
            for (let i = 0; i < 15; i++) {
                let x = random(width);
                let y = random(height * 0.6); // Snow in upper part
                ellipse(x, y, 4, 4);
            }
        }

        fill(0);
        text(`Temp: ${temperature.toFixed(1)}°C`, width / 2, height - 110);
        text(`Feels Like: ${feelsLikeTemperature.toFixed(1)}°C`, width / 2, height - 90);
        text(`Humidity: ${humidity}%`, width / 2, height - 70);
        text(`Clouds: ${cloudiness}%`, width / 2, height - 50);
        text(`Sunrise: ${sunriseTime}`, width / 2, height - 30);
        text(`Sunset: ${sunsetTime}`, width / 2, height - 10);


    } else {
        fill(0);
        text("Loading weather data...", width / 2, height / 2);
    }
}