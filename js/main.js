getLocation();
function loadResults() {
  updateLocalInfo();
  todaysWeather(lat, lon);
  fiveDayForecast(lat, lon);
}
setTimeout(loadResults, 300);

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
}

function todaysWeather(lat, lon) {
  const request = new XMLHttpRequest();
  let tempConverted = false;

  request.open('GET', `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`, true);
  request.onload = function() {
    if(request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      console.log(data);
      const region = data.sys.country;
      const temp = tempConversion(data.main.temp, region);

      const mainContent = `
        <div class="temp">${temp}</div>
        <div class="weather-icon__container">
          <svg><use class="weather-icon" xlink:href="#icons-${data.weather[0].icon}"></use></svg>
        </div>
        <div class="weather-description">${data.weather[0].description}</div>
        <div class="humidity">Humidity: ${data.main.humidity} %</div>
        <div class="wind-direction">Wind Direction: ${data.wind.deg} deg</div>
        <div class="wind-speed">Wind Speed: ${data.wind.speed} m/s</div>
      `
      document.querySelector('main').innerHTML = mainContent;
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
        let today = '';

        switch (new Date(data.list[i].dt_txt.replace(/\s+/g, 'T').concat('.000+08:00')).getDay()) {
          case 0:
            today = "SUN";
            break;
          case 1:
            today = "MON";
            break;
          case 2:
            today = "TUE";
            break;
          case 3:
            today = "WED";
            break;
          case 4:
            today = "THU";
            break;
          case 5:
            today = "FRI";
            break;
          case 6:
            today = "SAT";
            break;
        }

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
        forecastIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icons-${data.list[i].weather[0].icon}`);
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
