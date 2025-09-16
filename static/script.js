document.addEventListener("DOMContentLoaded", () => {
  const $id = (id) => document.getElementById(id);

  /* ===================== Modal Utilities ====================== */
  function showModal(id, display = "block") {
    document.querySelectorAll(".modal").forEach((m) => {
      m.style.display = "none";
      m.setAttribute("aria-hidden", "true");
    });
    const modal = $id(id);
    if (!modal) return;
    modal.style.display = display;
    modal.setAttribute("aria-hidden", "false");
  }

  function hideModal(id) {
    const modal = $id(id);
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  function hideAllModals() {
    document.querySelectorAll(".modal").forEach((m) => {
      m.style.display = "none";
      m.setAttribute("aria-hidden", "true");
    });
  }

  // Close modal on background click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) hideModal(e.target.id);
  });

  // Close all modals on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideAllModals();
  });

  // Close button
  document.querySelectorAll(".modal .close").forEach((btn) => {
    btn.addEventListener("click", (ev) =>
      hideModal(ev.target.closest(".modal").id)
    );
  });

  /* ===================== Login / Signup ====================== */
  if ($id("openLogin")) $id("openLogin").onclick = () => showModal("loginModal");
  if ($id("openSignup")) $id("openSignup").onclick = () => showModal("signupModal");
  if ($id("closeLogin")) $id("closeLogin").onclick = () => hideModal("loginModal");
  if ($id("closeSignup")) $id("closeSignup").onclick = () => hideModal("signupModal");

  if ($id("switchToLogin"))
    $id("switchToLogin").onclick = () => {
      hideModal("signupModal");
      showModal("loginModal");
    };

  if ($id("switchToSignup"))
    $id("switchToSignup").onclick = () => {
      hideModal("loginModal");
      showModal("signupModal");
    };


  /* ===================== Auto-generate username ====================== */
  function generateUsername() {
    const first = $id("firstName")?.value.trim() || "";
    const last = $id("lastName")?.value.trim() || "";
    if (first && last && $id("signupUsername")) {
      $id("signupUsername").value =
        first.toLowerCase() + "_" + last.toLowerCase();
    }
  }

  if ($id("firstName")) $id("firstName").addEventListener("input", generateUsername);
  if ($id("lastName")) $id("lastName").addEventListener("input", generateUsername);

  /* ===================== Password validation ====================== */
  function validatePassword(pwd) {
    const uppercase = (pwd.match(/[A-Z]/g) || []).length >= 2;
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const digits = (pwd.match(/[0-9]/g) || []).length >= 2;
    return uppercase && special && digits;
  }

  // Signup validation
  if ($id("signupForm")) {
    $id("signupForm").addEventListener("submit", (e) => {
      const pwd = $id("signupPassword").value;
      if (!validatePassword(pwd)) {
        e.preventDefault();
        $id("signupError").style.display = "block";
        $id("signupError").innerText =
          " Password must contain at least 2 uppercase letters, 1 special character, and 2 numbers.";
      }
    });
  }

  // Login validation
  if ($id("loginForm")) {
    $id("loginForm").addEventListener("submit", (e) => {
      const pwd = $id("loginPassword").value;
      if (!validatePassword(pwd)) {
        e.preventDefault();
        $id("loginError").style.display = "block";
        $id("loginError").innerText =
          " Invalid password format. Must be 2 uppercase, 1 special, 2 numbers.";
      }
    });
  }

  /* ===================== Shopping List ====================== */
  window.shoppingList = window.shoppingList || ["Bananas", "Cucumber", "Olive Oil"];
  const maxItems = 30;

  function renderShoppingPreview() {
    const preview = $id("shoppingPreview");
    if (!preview) return;
    preview.innerHTML = "";
    window.shoppingList.slice(0, 3).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      preview.appendChild(li);
    });
  }

  function renderFullList() {
    const fullList = $id("shoppingFullList");
    if (!fullList) return;
    fullList.innerHTML = "";
    window.shoppingList.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      fullList.appendChild(li);
    });
  }

  function addItem() {
    const input = $id("newItem");
    if (!input) return;
    const value = input.value.trim();
    if (value && window.shoppingList.length < maxItems) {
      window.shoppingList.push(value);
      input.value = "";
      renderShoppingPreview();
      renderFullList();
    } else if (window.shoppingList.length >= maxItems) {
      alert("Maximum 30 items allowed.");
    }
  }

  function resetList() {
    window.shoppingList = [];
    renderShoppingPreview();
    renderFullList();
  }

  window.addItem = addItem;
  window.resetList = resetList;

  if ($id("openShoppingPopup"))
    $id("openShoppingPopup").onclick = () => {
      renderFullList();
      showModal("shoppingModal", "flex");
    };
  if ($id("closeShoppingBtn"))
    $id("closeShoppingBtn").onclick = () => hideModal("shoppingModal");

  renderShoppingPreview();
  hideModal("shoppingModal");

  /* ===================== Shopping Reminder ====================== */
  function speakMessage(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  window.setShoppingReminder = function () {
    const timeInput = $id("reminderTime");
    if (!timeInput || !timeInput.value) {
      alert("Please select a reminder time.");
      return;
    }

    const [hours, minutes] = timeInput.value.split(":").map(Number);
    const now = new Date();
    const reminder = new Date();
    reminder.setHours(hours, minutes, 0, 0);

    if (reminder < now) reminder.setDate(reminder.getDate() + 1);

    const diff = reminder - now;
    const items =
      window.shoppingList.length > 0
        ? window.shoppingList.join(", ")
        : "your shopping list";

    const message = `Reminder! It's time to purchase ${items}.`;

    setTimeout(() => {
      speakMessage(message);
      alert(message);
    }, diff);

    alert(
      `Reminder set for ${reminder.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
  };

  /* ===================== Clock ====================== */
  function updateClock() {
    const now = new Date();
    if ($id("clockTime"))
      $id("clockTime").textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    if ($id("clockDate"))
      $id("clockDate").textContent = now.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  }
  setInterval(updateClock, 1000);
  updateClock();

/* ===================== Weather ====================== */

let interval = 5 * 60 * 1000; // 5 minutes default
let weatherInterval;
let voicesLoaded = false;

// Map OpenWeather icons -> FontAwesome
function mapIcon(iconCode) {
  switch (iconCode) {
    case '01d': return 'fa-sun';
    case '01n': return 'fa-moon';
    case '02d': return 'fa-cloud-sun';
    case '02n': return 'fa-cloud-moon';
    case '03d':
    case '03n':
    case '04d':
    case '04n': return 'fa-cloud';
    case '09d':
    case '09n': return 'fa-cloud-showers-heavy';
    case '10d':
    case '10n': return 'fa-cloud-rain';
    case '11d':
    case '11n': return 'fa-bolt';
    case '13d':
    case '13n': return 'fa-snowflake';
    case '50d':
    case '50n': return 'fa-smog';
    default: return 'fa-cloud';
  }
}

// Load voices
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) voicesLoaded = true;
  else speechSynthesis.addEventListener('voiceschanged', () => { voicesLoaded = true; });
}

// AI Voice
function speakWeather(temp, desc, cityName) {
  if (!('speechSynthesis' in window) || !voicesLoaded) return;
  speechSynthesis.cancel();
  const msg = `The current weather in ${cityName} is ${desc} with a temperature of ${temp} degrees Celsius.`;
  const utter = new SpeechSynthesisUtterance(msg);
  const voices = speechSynthesis.getVoices();
  utter.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  speechSynthesis.speak(utter);
}

// Fetch weather from your Flask backend
async function fetchWeather(lat = 12.9716, lon = 77.5946) {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    if (data.error) {
      console.error("Weather API error:", data.error);
      return;
    }

    const w = data.weather;
    const temp = Math.round(w.temp);
    const desc = w.desc;
    const iconCode = w.icon;

    document.getElementById('wTemp').innerText = `${temp}°C`;
    document.getElementById('wCity').innerText = w.city;
    document.getElementById('wDesc').innerText = desc.charAt(0).toUpperCase() + desc.slice(1);

    // Update FontAwesome icon
    const iconEl = document.getElementById('wIcon');
    iconEl.className = 'fa-solid fa-2x ' + mapIcon(iconCode);

    // AI voice announcement
    speakWeather(temp, desc, w.city);

  } catch (e) {
    console.error('Weather fetch error:', e);
  }
}

// Interval settings
document.getElementById('weatherSettings').addEventListener('click', () => {
  const min = prompt("Enter interval in minutes:", "5");
  if (min && !isNaN(min)) {
    interval = parseInt(min) * 60 * 1000;
    if (weatherInterval) clearInterval(weatherInterval);
    weatherInterval = setInterval(fetchWeather, interval);
    alert(`✅ Weather updates will now be announced every ${min} minutes.`);
  }
});

// Initialize
function initWeather() {
  loadVoices();

  // If you want geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
        weatherInterval = setInterval(() => fetchWeather(pos.coords.latitude, pos.coords.longitude), interval);
      },
      () => {
        // fallback to Bengaluru
        fetchWeather();
        weatherInterval = setInterval(fetchWeather, interval);
      }
    );
  } else {
    fetchWeather();
    weatherInterval = setInterval(fetchWeather, interval);
  }
}
initWeather();
  /* ===================== News ====================== */
  async function getNews() {
    const ul = $id("newsList");
    ul.innerHTML = "<li>Loading...</li>";
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      ul.innerHTML = "";
      (data.items || []).forEach((it) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${it.link}" target="_blank">${it.title}</a>`;
        ul.appendChild(li);
      });
    } catch (e) {
      ul.innerHTML = "<li>News unavailable</li>";
    }
  }
  getNews();
  /* ===================== Events ====================== */
  async function getEvents() {
    const ul = $id("eventsList");
    ul.innerHTML = "<li>Loading events...</li>";
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      ul.innerHTML = "";
      (data || []).forEach((ev) => {
        const li = document.createElement("li");
        li.textContent = ev.name;
        ul.appendChild(li);
      });
      if (!data || data.length === 0) {
        ul.innerHTML = "<li>No events found nearby</li>";
      }
    } catch (e) {
      ul.innerHTML = "<li>Events unavailable</li>";
    }
  }
  getEvents();
  /* ===================== Calendar ====================== */
  (function () {
    const STORAGE_KEY = "calEvents";
    let calEvents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    let selectedDate = null;
    let current = new Date();

    const calBox = $id("calBox");
    const calTitle = $id("calTitle");
    const prevBtn = $id("prevMonth");
    const nextBtn = $id("nextMonth");
    const saveBtn = $id("saveEventBtn");
    const deleteBtn = $id("deleteEventBtn");
    const selectedDateEl = $id("selectedDate");
    const eventTextInput = $id("eventText");

    function persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calEvents));
    }

    function renderCalendar(year, month) {
      if (!calBox || !calTitle) return;
      calTitle.textContent = `${new Date(year, month).toLocaleString("default", {
        month: "long",
      })} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();

      let html = "<table><tr>";
      for (let i = 0; i < firstDay; i++) html += "<td></td>";

      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        let classes = "cal-day";
        if (d === today.getDate() && year === today.getFullYear() && month === today.getMonth()) classes += " cal-today";
        if (calEvents[dateKey]) classes += " cal-event";

        html += `<td><div class="${classes}" data-date="${dateKey}">${d}</div></td>`;
        if ((d + firstDay) % 7 === 0) html += "</tr><tr>";
      }
      html += "</tr></table>";

      calBox.innerHTML = html;

      calBox.querySelectorAll("[data-date]").forEach((el) =>
        el.addEventListener("click", () => {
          selectedDate = el.dataset.date;
          if (selectedDateEl) selectedDateEl.textContent = `Selected Date: ${selectedDate}`;
          if (eventTextInput) eventTextInput.value = calEvents[selectedDate] || "";
          showModal("calModal");
        })
      );
    }

    if (prevBtn) prevBtn.onclick = () => {
      current.setMonth(current.getMonth() - 1);
      renderCalendar(current.getFullYear(), current.getMonth());
    };
    if (nextBtn) nextBtn.onclick = () => {
      current.setMonth(current.getMonth() + 1);
      renderCalendar(current.getFullYear(), current.getMonth());
    };
    if (saveBtn) saveBtn.onclick = () => {
      if (!selectedDate) return;
      const text = eventTextInput.value.trim();
      if (text) calEvents[selectedDate] = text;
      else delete calEvents[selectedDate];
      persist();
      hideModal("calModal");
      renderCalendar(current.getFullYear(), current.getMonth());
    };
    if (deleteBtn) deleteBtn.onclick = () => {
      if (!selectedDate) return;
      delete calEvents[selectedDate];
      persist();
      hideModal("calModal");
      renderCalendar(current.getFullYear(), current.getMonth());
    };

    renderCalendar(current.getFullYear(), current.getMonth());
  })();

  /* ===================== YouTube Voice Commands ====================== */
const micBtn = document.querySelector(".mic-btn");
const mediaFrame = document.querySelector(".media-frame");

let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
} else if ("SpeechRecognition" in window) {
  recognition = new SpeechRecognition();
} else {
  alert("Speech Recognition not supported in this browser.");
}

if (recognition) {
  recognition.continuous = false;
  recognition.lang = "en-US";

  micBtn.addEventListener("click", () => {
    recognition.start();
  });

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    console.log("User said:", transcript);

    if (transcript.includes("stop playing")) {
      mediaFrame.innerHTML = ""; // remove iframe
      return;
    }

    // Call backend to search YouTube
    const response = await fetch("/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: transcript })
    });

    const data = await response.json();
    if (data.videoId) {
      mediaFrame.innerHTML = `
        <iframe width="100%" height="220" 
          src="https://www.youtube.com/embed/${data.videoId}?autoplay=1" 
          frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
        </iframe>
      `;
    } else {
      mediaFrame.innerHTML = `<p style="color:#aaa;">No video found.</p>`;
    }
  };
}
});
