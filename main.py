# app.py
import os
import re
import json
import time
import feedparser
import requests
import urllib.parse
from datetime import datetime, timedelta
from threading import Thread
from typing import Optional

from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, jsonify
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import mysql.connector

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(APP_ROOT, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "supersecretkey_change_in_production"

# ---------- DB  ----------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "luxury_ai"
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

SHOPPING_FILE = os.path.join(APP_ROOT, "shopping_list.json")
CALENDAR_FILE = os.path.join(APP_ROOT, "calendar.json")

RSS_URL = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
WEATHER_API_KEY = "f34f8c416909f4920506495d8b8d8f49"
EVENTS_API_KEY = "qUc9GYwUuZHkwp3zE0tSCDfjhK3x5YwO"

PASSWORD_REGEX = re.compile(r"^(?=(?:.*[A-Z]){2,})(?=(?:.*\d){2,})(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{6,}$")

def read_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return []
    return []

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_user_by_username(username: str):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def get_weather(lat=12.9716, lon=77.5946):
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"lat": lat, "lon": lon, "appid": WEATHER_API_KEY, "units": "metric"}
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        app.logger.error("Weather fetch error: %s", e)
        return None

@app.route("/api/weather")
def api_weather():
    lat = request.args.get("lat", type=float, default=12.9716)
    lon = request.args.get("lon", type=float, default=77.5946)
    data = get_weather(lat, lon)
    if not data:
        return jsonify({"error": "Weather unavailable"}), 500
    try:
        return jsonify({
            "weather": {
                "temp": data["main"]["temp"],
                "city": data.get("name"),
                "desc": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"]
            }
        })
    except Exception as e:
        app.logger.error("Parsing weather failed: %s", e)
        return jsonify({"error": "Invalid weather data"}), 500

def get_news(limit=10):
    try:
        feed = feedparser.parse(RSS_URL)
        items = []
        for entry in feed.entries[:limit]:
            items.append({
                "title": entry.get("title"),
                "link": entry.get("link"),
                "published": entry.get("published")
            })
        return items
    except Exception as e:
        app.logger.error("News fetch error: %s", e)
        return []

@app.route("/api/news")
def api_news():
    return jsonify({"items": get_news()})

def get_local_events(lat=12.9716, lon=77.5946, radius=50):
    try:
        url = "https://app.ticketmaster.com/discovery/v2/events.json"
        params = {
            "apikey": EVENTS_API_KEY,
            "latlong": f"{lat},{lon}",
            "radius": radius,
            "unit": "km",
            "locale": "*",
            "size": 10,
            "sort": "date,asc"
        }
        res = requests.get(url, params=params, timeout=10)
        if res.status_code != 200:
            app.logger.error("Ticketmaster API error: %s %s", res.status_code, res.text)
            return []
        data = res.json()
        events = []
        for e in data.get("_embedded", {}).get("events", []):
            events.append({
                "name": e.get("name"),
                "url": e.get("url"),
                "date": e.get("dates", {}).get("start", {}).get("localDate"),
                "venue": e.get("_embedded", {}).get("venues", [{}])[0].get("name")
            })
        return events
    except Exception as e:
        app.logger.error("Events fetch error: %s", e)
        return []

@app.route("/api/events")
def api_events():
    return jsonify(get_local_events())

@app.route("/shopping/add", methods=["POST"])
def add_item():
    data = request.get_json() or {}
    item = data.get("item")
    if not item:
        return jsonify({"error": "No item provided"}), 400
    items = read_json(SHOPPING_FILE)
    items.append({"id": len(items) + 1, "name": item})
    write_json(SHOPPING_FILE, items)
    return jsonify(items), 201

@app.route("/shopping/reset", methods=["POST"])
def reset_shopping():
    write_json(SHOPPING_FILE, [])
    return jsonify([])

@app.route("/calendar/add", methods=["POST"])
def add_event():
    data = request.get_json() or {}
    title = data.get("title")
    date = data.get("date")
    if not title or not date:
        return jsonify({"error": "Missing title or date"}), 400
    events = read_json(CALENDAR_FILE)
    event_id = int(datetime.now().timestamp() * 1000)
    events.append({"id": event_id, "title": title, "date": date})
    write_json(CALENDAR_FILE, events)
    return jsonify(events), 201

@app.route("/calendar/delete", methods=["POST"])
def delete_event():
    data = request.get_json() or {}
    event_id = data.get("id")
    if not event_id:
        return jsonify({"error": "Missing id"}), 400
    events = read_json(CALENDAR_FILE)
    events = [e for e in events if str(e["id"]) != str(event_id)]
    write_json(CALENDAR_FILE, events)
    return jsonify(events)

def get_first_youtube_video(query: str) -> Optional[str]:
    try:
        q = urllib.parse.quote_plus(query)
        url = f"https://www.youtube.com/results?search_query={q}"
        r = requests.get(url, timeout=10).text
        match = re.search(r"watch\?v=(.{11})", r)
        if match:
            return match.group(1)
    except Exception as e:
        app.logger.error("YouTube search error: %s", e)
    return None

@app.route("/search", methods=["POST"])
def search_youtube():
    data = request.get_json() or {}
    query = data.get("query")
    if not query:
        return jsonify({"error": "No query provided"}), 400
    video_id = get_first_youtube_video(query)
    if video_id:
        return jsonify({"videoId": video_id})
    return jsonify({"error": "No video found"}), 404

def allowed_file(filename):
    allowed = {"png", "jpg", "jpeg", "gif"}
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed

@app.route("/signup", methods=["POST"], endpoint="signup_page")
def signup():
    first = request.form.get("firstName", "").strip()
    last = request.form.get("lastName", "").strip()
    email = request.form.get("email", "").strip()
    phone = request.form.get("phone", "").strip()
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    if not (first and last and email and username and password):
        return redirect(url_for("dashboard"))

    if not PASSWORD_REGEX.match(password):
        return redirect(url_for("dashboard"))

    photo_filename = None
    profile_photo = request.files.get("profilePhoto")
    if profile_photo and profile_photo.filename:
        if allowed_file(profile_photo.filename):
            safe_name = secure_filename(profile_photo.filename)
            timestamp = int(time.time())
            photo_filename = f"{timestamp}_{safe_name}"
            save_path = os.path.join(UPLOAD_DIR, photo_filename)
            profile_photo.save(save_path)

    hashed = generate_password_hash(password)

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO users (first_name, last_name, email, phone, username, password, profile_photo)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (first, last, email, phone, username, hashed, photo_filename)
        )
        conn.commit()
        cur.close()
        conn.close()
        return redirect(url_for("dashboard"))
    except mysql.connector.IntegrityError:
        return redirect(url_for("dashboard"))
    except Exception as e:
        print("Signup error:", e)
        return redirect(url_for("dashboard"))

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")
    if not username or not password:
        return render_template("dashboard.html", username=None, profile_photo=None, show_login=True, login_error="Provide username and password.")

    user = get_user_by_username(username)
    if user and check_password_hash(user.get("password", ""), password):
        session["username"] = user["username"]
        session["profile_photo"] = user.get("profile_photo") or "default.png"
        return redirect(url_for("dashboard"))

    return render_template("dashboard.html", username=None, profile_photo=None, show_login=True, login_error="Invalid username or password.")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("dashboard"))

# ----------- FIXED login_required (single version) ----------
def login_required(f):
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "username" not in session:
            # Instead of redirecting to dashboard blindly, pass login message
            return render_template(
                "dashboard.html",
                username=None,
                profile_photo=None,
                show_login=True,
                login_error="⚠ Please login to get the access."
            )
        return f(*args, **kwargs)
    return wrapper


@app.route("/dashboard")
@login_required
def dashboard():
    return render_template(
        "dashboard.html",
        username=session.get("username"),
        profile_photo=session.get("profile_photo"),
        show_login=False
    )


@app.route("/")
def index():
    return redirect(url_for("dashboard"))


def reminders_loop():
    while True:
        try:
            now = datetime.now()
            items = read_json(SHOPPING_FILE)
            events = read_json(CALENDAR_FILE)
            # You can log reminders here...
        except Exception as e:
            app.logger.error("Reminders loop error: %s", e)
        time.sleep(60)

Thread(target=reminders_loop, daemon=True).start()

# ---------- START ----------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
