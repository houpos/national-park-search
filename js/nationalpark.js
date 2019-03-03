//National Park Service API Info
const apiKeyNP = '[YOUR API KEY]';
const urlNP = 'https://api.nps.gov/api/v1/parks';
const stateCode = '?stateCode='; 
const pkCode = '?parkCode=';

// APIXU Info
const apiKey = '[YOUR API KEY]';
const urlXU = 'https://api.apixu.com/v1/forecast.json';
const key = '?key=';

//Page Elements
const $submit = $('#submit');
const $destination = $('#destination');
const $container = $('#results');
const $parkDiv = $('#parkInfo');
const $weatherDiv = $('#weather');
const $parkDropDown = $('#selectPark');
const weekDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];

const createParkSelection = (code, name) => {
      return `<option value='${code}'>${name}</option>`;
}
  
const createWeatherHTML = (currentDay) => {
  return `<div class="card">
  <img class="card-img-top weathericon" src="https://${currentDay.day.condition.icon}">
  <div class="card-body" id="park">
      <h5 class="card-title">${weekDays[(new Date(currentDay.date)).getDay()]}</h5>
      <p class="card-text"> High: ${currentDay.day.maxtemp_f} <br /> Low: ${currentDay.day.mintemp_f}</p>
  </div>
  </div>`;
}

const createParkHTML = (name, url, desc, images, address) => {
  let carouselImages;
  for (let item in images) {
    let active = '';
    if (item === '0') {
      active = 'active';
    }
    const temp = `<div class="carousel-item ${active}">
    <img alt='${images[item].altText}' class="d-block" src="${images[item].url}">
  </div>`;
    carouselImages += temp;
  }

  return `
  <div class="col-md-5">
    <h2 class="featurette-heading"><a class='nodecor' tarket='_blank' href='${url}'>${name}</a></h2>
    <h4>${address}</h4>
  <p>${desc}</p>
  </div>
  <div class="col-md-7">
  <div id="sewing-carousel" class="carousel slide" data-ride="carousel">
      <div class="carousel-inner">
          ${carouselImages}
      </div>
      <a class="carousel-control-prev" href="#sewing-carousel" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#sewing-carousel" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
      </a>
    </div>
    </div>`;
}

const getParks = async () => {
  $parkDropDown.empty();
  const stateSelection = $('#selectState').val();
  const urlToFetch = `${urlNP}${stateCode}${stateSelection}&api_key=${apiKeyNP}`;
  try {
      const response = await fetch(urlToFetch);
      if (response.ok) {
          const jsonResponse = await response.json();
          const data = jsonResponse.data;
          const parkCode = data.map(item => item.parkCode);
          const parkName = data.map(item => item.name);

          let parkInfo = {};

          parkCode.forEach((item, index) => {
            parkInfo[parkCode[index]] = parkName[index];
          });
          return parkInfo;
      }
  } catch(err) {
      console.log('Error in getParks(): ' + err);
  }
}

const getParkInfo = async () => {
  const parkCode = $parkDropDown.val();
  const urlToFetch = `${urlNP}${pkCode}${parkCode}&limit=1&fields=images,addresses&api_key=${apiKeyNP}`;
  try {
      const response = await fetch(urlToFetch);
      if (response.ok) {
          const jsonResponse = await response.json();
          const data = jsonResponse.data;
          return data;
      }
  } catch(err) {
      console.log('Error in getParks(): ' + err);
  }
}

const getForecast = async (address) => {
    const urlToFetch = `${urlXU}${key}${apiKey}&q=${address}&days=5&hour=11`;
    try {
        const response = await fetch(urlToFetch);
        const jsonResponse = await response.json();
        const days = jsonResponse.forecast.forecastday;
        return days;
    } catch(err) {
        console.log(err);
    }

}

// Render functions
const renderPark = (park) => {
  const addresses = park.map(item => item.addresses[0]);
  const images = park.map(item => item.images);
  let physicalAddress, zipCode;
  for (let item in addresses) {
    if(addresses[item].type === 'Physical') {
      physicalAddress = addresses[item].city + ', ' + addresses[item].stateCode;
      zipCode = addresses[item].postalCode;
    } else if (!physicalAddress) {
      physicalAddress = addresses[item].city + ', ' + addresses[item].stateCode;
      zipCode = addresses[item].postalCode;
    }
  }

  const parkContent = createParkHTML(park[0].fullName, park[0].url, park[0].description, images[0], physicalAddress);
  $parkDiv.append(parkContent);
  return zipCode.toString().substr(0,5);
};
  
  const renderForecast = (days) => {
    days.forEach((item, index) => {
      const currentDay = days[index];
      const weatherContent = createWeatherHTML(currentDay);
      $weatherDiv.append(weatherContent);
    });
  };

   const renderParkSelect = (parkInfo) => {
    for (let item in parkInfo) {
      const parkContent = createParkSelection(item, parkInfo[item]);
      $parkDropDown.append(parkContent);
    }
  };

const executeSearch = () => {
    $weatherDiv.empty();
    $parkDiv.empty();
    $container.css({
      "visibility": "visible",
      "display": "block"});
    getParkInfo()
      .then(park => renderPark(park))
      .then(address => getForecast(address))
      .then(weather => renderForecast(weather));
    return false;
  }

$submit.click(executeSearch);
$("#selectState").load("../reuse/state.html");
