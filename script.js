const DEMO_MODE = false;


const services = {
  medical: { name: "College Ambulance", call: "8767707621", sms: "+918767707621" },
  fire: { name: "Campus Fire Safety", call: "9356564103", sms: "+919356564103" },
  security: { name: "Campus Security", call: "8208937655", sms: "+918208937655" }
};

const aiKeywords = {
  medical: ["faint", "bleeding", "injured", "collapsed", "pain", "unconscious"],
  fire: ["fire", "smoke", "burn", "gas", "flames", "short circuit"],
  security: ["fight", "attack", "threat", "weapon", "violence", "robbery"]
};

let lastLocation = null;

function fetchLocation(callback) {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(6);
      const lon = pos.coords.longitude.toFixed(6);
      const mapURL = `https://www.google.com/maps?q=${lat},${lon}`;

      lastLocation = { mapURL };

      document.getElementById("coords").innerText =
        `Latitude: ${lat}, Longitude: ${lon}`;
      document.getElementById("mapLink").href = mapURL;
      document.getElementById("locationBox").classList.remove("hidden");

      if (callback) callback();
    },
    () => alert("Enable GPS for accurate location."),
    { enableHighAccuracy: true }
  );
}


function sendLocationSMS(type) {
  const s = services[type];
  const msg =
    `EMERGENCY ALERT\nService: ${s.name}\nLocation: ${lastLocation.mapURL}\nSent via CampusSOS`;

  window.location.href = `sms:${s.sms}?body=${encodeURIComponent(msg)}`;
}


function shareLocation(type) {
  fetchLocation(() => sendLocationSMS(type));
}


function callOnly(type) {
  const s = services[type];

  if (DEMO_MODE) {
    alert(`Demo Mode: Would call ${s.name}`);
    return;
  }

  if (confirm(`Call ${s.name} now?`)) {
    window.location.href = `tel:${s.call}`;
  }
}


function detectType(text) {
  let score = { medical: 0, fire: 0, security: 0 };
  for (let t in aiKeywords) {
    aiKeywords[t].forEach(w => {
      if (text.includes(w)) score[t]++;
    });
  }
  return Object.keys(score).reduce((a, b) => score[a] > score[b] ? a : b);
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const chat = document.getElementById("chatMessages");
  const text = input.value.trim();
  if (!text) return;

  chat.innerHTML += `<div class="user">🧑 ${text}</div>`;
  input.value = "";

  const type = detectType(text.toLowerCase());

  setTimeout(() => {
    chat.innerHTML +=
      `<div class="bot">🤖 This looks like a ${services[type].name}. I’m sharing your live location.</div>`;
    fetchLocation(() => sendLocationSMS(type));
    chat.scrollTop = chat.scrollHeight;
  }, 600);
}
