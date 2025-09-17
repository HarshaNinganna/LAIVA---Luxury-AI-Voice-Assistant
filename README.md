# Luxury AI Voice Assistant  

Luxury AI Voice Assistant is a Flask-based intelligent assistant that combines multiple services into a single interactive dashboard. It provides users with real-time information such as news, weather updates, and events, while also offering utilities like a shopping list, calendar reminders, and media search. With secure authentication, file upload support, and a voice-enabled interface, this project simulates a personal digital assistant accessible via the web.  

---

## 🚀 Features  

- **User Authentication**  
  - Secure **Signup/Login/Logout** system using hashed passwords.  
  - Profile photo upload and storage.  
  - Regex-based password validation for strong security.  

- **Personalized Dashboard**  
  - Displays user profile and information once logged in.  
  - Blocks unauthorized access with a login modal.  

- **Weather Updates** 🌦️  
  - Fetches real-time weather data using **OpenWeather API**.  
  - Provides temperature, description, city name, and icon.  

- **News Feed** 📰  
  - Integrates **Google News RSS Feed**.  
  - Displays the latest headlines with links and published time.  

- **Local Events** 🎫  
  - Uses **Ticketmaster API** to fetch nearby events.  
  - Provides event name, date, venue, and ticket link.  

- **Shopping List** 🛒  
  - Add and manage shopping items.  
  - Save and reset list easily (stored in JSON).  

- **Calendar Reminders** 📅  
  - Add and delete events with dates.  
  - Stored locally in JSON for persistence.  

- **YouTube Search & Media Player** 🎶  
  - Search and play the first YouTube video result.  
  - Voice-enabled commands to search or stop playback.  

- **Background Services**  
  - Thread-based reminder loop for events and shopping items.  

---

## 🛠️ Tech Stack  

- **Backend**: Python, Flask  
- **Frontend**: HTML, CSS, JavaScript  
- **Database**: MySQL (for user authentication & profiles)  
- **APIs Integrated**:  
  - OpenWeather (Weather Data)  
  - Google News RSS (News Feed)  
  - Ticketmaster API (Local Events)  
  - YouTube Search Scraper (Media Search)  
- **Others**: JSON storage for shopping list and calendar  

---

## 📂 Project Structure  
Luxury-AI-Assistant/
│── main.py # Main Flask Application
│── templates/ # HTML Templates (Dashboard with login modal)
│── static/ # CSS, JS, Images, Profile uploads
│── data/shopping_list.json # Stores shopping list
│──      calendar.json # Stores calendar events
│──      notification.json #reminder for shopping list and calendar   
│── requirements.txt # Dependencies
│── README.md # Project Documentation

---

---

## ⚙️ Setup Instructions  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/HarshaNinganna/Luxury-AI-Assistant.git
   cd Luxury-AI-Assistant
   ```
2.**Create virtual environment & install dependencies**
```bash
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows
pip install -r requirements.txt
```
3.**Configure Database**

Create a MySQL database named luxury_ai.

Run the SQL script (if available) to create the users table.

Update your DB_CONFIG in app.py with your MySQL credentials.

Example table:
```bash
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(15),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    profile_photo VARCHAR(255)
);
```
4.**Run the application**
```bash
python main.py
```
5.**Access in browser**
```bash
- Visit: http://127.0.0.1:5000
```

**Authentication Rules**

Username: chosen at signup.

Password must follow rules:

Minimum 6 characters.

At least 2 uppercase letters.

At least 2 numbers.

At least 1 special character.

If invalid, the signup will fail with a message.

 **Screenshots**

## Screenshots  

### Login  
![Login](static/Screenshot%20(252).png)  

### SignUp  
![SignUp](static/Screenshot%20(253).png)  

### Dashboard  
![Dashboard](static/Screenshot%20(254).png)  

### Shopping List Reminder (AI Voice)  
![Shopping List Reminder AI VOICE](static/Screenshot%20(255).png)  

### Calendar Mark  
![Calendar Mark](static/Screenshot%20(256).png)  


## 📂 Future Enhancements

Add voice recognition AI (e.g., Speech-to-Text API).

Integrate Google Calendar API for cloud-synced reminders.

Provide multi-user support with role-based dashboards.

Add dark/light mode toggle.


## 🧑‍💼 Author

Harsha N

GitHub: HarshaNinganna
   
   

