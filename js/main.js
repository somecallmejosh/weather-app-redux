getLocation();
function loadResults() {
  updateLocalInfo();
  todaysWeather(lat, lon);
  fiveDayForecast(lat, lon);
}
setTimeout(loadResults, 200);

let city = '';
let lat = '';
let lon = '';
let region = '';
let zip = '';
const mainContent = document.querySelector('.main');
const apiKey = 'cd11931c3718288fa737a331a243db04';

function getLocation() {
  const request = new XMLHttpRequest();
  request.open('GET', 'http://ip-api.com/json', true);
  request.onload = function() {
    if(request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      city = data.city;
      lat = data.lat;
      lon = data.lon;
      region = data.region;
      regionaName = data.regionName;
      zip = data.zip;
    } else {
      console.log("No data to report. Sorry!");
    }
  }
  request.onerror = function() {
    console.log("Couldn't connect to your endpoint.");
  }
  request.send();
}

function getDate() {
  let options = { weekday: 'short', month: 'short', day: 'numeric' };
  let today = new Date();
  return today.toLocaleDateString('en-us', options);
}

function updateLocalInfo() {
  const locationText = document.querySelector('.location');
  const currentDate = document.querySelector('.current-date');
  locationText.textContent = `${city}, ${region}`;
  currentDate.textContent = getDate();
}

function tempConversion(temp, region) {
  let tempToNum = parseInt(temp);
  if(region === 'US') {
    return ((tempToNum - 273.15) * 1.8 + 32).toFixed(0);
  } else {
    return (tempToNum - 273).toFixed(0);
  }
  con
}

function todaysWeather(lat, lon) {
  const request = new XMLHttpRequest();
  const tempContainer = document.querySelector('.temp');
  const weatherDescriptionContainer = document.querySelector('.weather-description');
  const weatherIcon = document.querySelector('.weather-icon');
  const humidityContainer = document.querySelector('.humidity');
  const windSpeedContainer = document.querySelector('.wind-speed');
  const windDirectionContainer = document.querySelector('.wind-direction');
  let tempConverted = false;

  request.open('GET', `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`, true);
  request.onload = function() {
    if(request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      console.log(data);
      const region = data.sys.country;
      tempContainer.textContent = tempConversion(data.main.temp, region);
      weatherDescriptionContainer.textContent = data.weather[0].description;
      weatherIcon.setAttribute('href', `#icons-${data.weather[0].icon}`);
      humidityContainer.textContent = `Humidity: ${data.main.humidity} %`;
      windSpeedContainer.textContent = `Wind Speed: ${data.wind.speed} m/s`;
      windDirectionContainer.textContent = `Wind Direction: ${data.wind.deg} deg`;
    } else {
      console.log("No weather for today");
    }
  }
  request.onerror = function() {
    console.log("Couldn't connect to your endpoint");
  }
  request.send();
}

function fiveDayForecast(lat, lon) {
  const forecastContainer = document.querySelector('.forecast');
  const request = new XMLHttpRequest();
  request.open('GET', `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`, true);

  request.onload = function() {
    if(request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      const region = data.city.country;

      // console.log(data);

      // Grab noon time temps for these days (1+8 works out to be noon)
      for(let i = 4; i < data.list.length; i = i+8) {
        const today = new Date(data.list[i].dt_txt).getUTCDay();

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast__item');
        forecastContainer.appendChild(forecastItem);

        const forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast__date');
        forecastDay.textContent = today;
        forecastItem.appendChild(forecastDay);

        const forecastIconContainer = document.createElement('div');
        forecastIconContainer.classList.add('forecast__icon');
        const forecastSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        forecastIconContainer.appendChild(forecastSVG);
        const forecastIcon = document.createElementNS("http://www.w3.org/2000/svg", 'use');
        forecastIcon.setAttribute('href', `#icons-${data.list[i].weather[0].icon}`);
        forecastSVG.appendChild(forecastIcon);
        forecastItem.appendChild(forecastIconContainer);

        const forecastTempContainer = document.createElement('div');
        forecastTempContainer.classList.add('forecast__temp');
        forecastTempContainer.textContent = tempConversion(data.list[i].main.temp, region) ;
        forecastItem.appendChild(forecastTempContainer);

      }
    } else {
      console.log("no data")
    }
  }

  request.onerror = function() {
    console.log("Couldn't connect to your enpoint.");
  }

  request.send();
}
