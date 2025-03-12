# Maptify

## Overview

Maptify is a JavaScript-based web application that helps users track their running and cycling workouts on an interactive map. Users can log their activities with details like distance, duration, pace (for running), and speed/elevation gain (for cycling). The app uses the browser's geolocation API and stores data in local storage for persistence.

## Features

- 📍 Track workouts based on geolocation.
- 🏃‍♂️🚴 Record running and cycling activities.
- 📊 View detailed stats such as pace, speed, and elevation.
- 💾 Persist workout data using local storage.
- 🖱️ Interact with an intuitive UI for workout logging.

## Technologies Used

- **JavaScript (ES6+)**
- **Leaflet.js** (for mapping)
- **HTML/CSS**
- **Local Storage API**
- **Geolocation API**

## How It Works

1. **Load the app**: The app requests access to the user's location.
2. **Click on the map**: A form appears to log a new workout.
3. **Enter workout details**: Users input workout type, distance, duration, and cadence/elevation.
4. **Submit the form**: The workout appears on the list and map.
5. **View saved workouts**: Stored in local storage for persistence.

## Project Structure

```
maptify/
├── index.html
├── style.css
├── script.js
├── assets/
```

## Screenshots

![Main Screen](maptify-screenshot.png)

## Future Improvements

- 🏋️ Implement additional workout types.
- 📂 Enable tracking the whole workout route

## Acknowledgments

This project is inspired by **Jonas Schmedtmann's JavaScript course on Udemy**. HTML / CSS provided by the course.
