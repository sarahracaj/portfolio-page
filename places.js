const places = [
  {
    name: "Jale",
    country: "Albania",
    lat: 40.1035,
    lng: 19.7448,
    bestTime: "June to September",
  },
  {
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    bestTime: "April to June",
  },
  {
    name: "Istanbul",
    country: "Turkey",
    lat: 41.0082,
    lng: 28.9784,
    bestTime: "April to September",
  },
  {
    name: "Pristina",
    country: "Kosovo",
    lat: 42.6629,
    lng: 21.1655,
    bestTime: "May to September",
  },
  {
    name: "Rome",
    country: "Italy",
    lat: 41.9028,
    lng: 12.4964,
    bestTime: "April, May, October",
  },
];

async function getWeather(place) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lng}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  return res.json();
}

function formatTime(time) {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderCards(data) {
  const container = document.getElementById("places-cards");

  container.innerHTML = data
    .map(({ place, weather }) => {
      const d = weather.daily;

      return `
          <div class="place-card">
            <h3 class="place-name">${place.name}</h3>
            <p class="place-country">${place.country}</p>
  
            <div class="place-meta">
              <div class="place-meta-row">
                <span>Temp</span>
                <span>${d.temperature_2m_max[0]}° / ${
        d.temperature_2m_min[0]
      }°</span>
              </div>
              <div class="place-meta-row">
                <span>Sunrise</span>
                <span>${formatTime(d.sunrise[0])}</span>
              </div>
              <div class="place-meta-row">
                <span>Sunset</span>
                <span>${formatTime(d.sunset[0])}</span>
              </div>
              <div class="place-meta-row">
                <span>Best Time</span>
                <span>${place.bestTime}</span>
              </div>
            </div>
          </div>
        `;
    })
    .join("");
}

function initMap(data) {
  const map = L.map("places-map", {
    scrollWheelZoom: false,
    zoomControl: false,
  });

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    }
  ).addTo(map);

  const bounds = [];

  data.forEach(({ place }) => {
    const marker = L.circleMarker([place.lat, place.lng], {
      radius: 7,
      fillColor: "#44132d",
      color: "#f3efe6",
      weight: 2,
      fillOpacity: 0.95,
    }).addTo(map);

    marker.bindPopup(`
        <div class="custom-popup">
          <strong>${place.name}</strong><br>
          <span>${place.country}</span>
        </div>
      `);

    marker.on("mouseover", function () {
      this.openPopup();
    });

    marker.on("mouseout", function () {
      this.closePopup();
    });

    bounds.push([place.lat, place.lng]);
  });

  map.fitBounds(bounds, { padding: [50, 50] });
}

async function init() {
  const results = await Promise.all(
    places.map(async (place) => {
      const weather = await getWeather(place);
      return { place, weather };
    })
  );

  renderCards(results);
  initMap(results);
}

document.addEventListener("DOMContentLoaded", init);
