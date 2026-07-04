<div align="center">

<img src="./public/logo.svg" alt="NutriZen AI logo" width="90" />

# 🥗 NutriZen AI

### AI-Powered Nutrition & Meditation Assistant



 A full-featured wellness web app that helps users track nutrition, hydration, fitness goals, and mindfulness — all in one clean, responsive dashboard.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![React Router](https://img.shields.io/badge/React_Router-6.22-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-8884d8)](https://recharts.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 About The Project

**NutriZen AI** is a full-stack-ready React application designed to make
healthy living simple and engaging. It combines nutrition tracking,
hydration reminders, fitness goal management, and guided mindfulness tools
into a single, cohesive experience — with a polished UI, dark mode, sound
feedback, and browser notifications.

Built as a full-stack AI-powered web application, component architecture, state management, data persistence,
responsive design, and UI/UX polish.**

<br/>

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Register/login flow with persisted sessions |
| 📷 **Food Scanner** | Upload a food photo to get instant nutrition estimates |
| 📔 **Food Diary** | Auto-logs scanned meals with timestamps |
| 🔥 **Calorie Tracker** | Daily calorie logging with goal progress bar + 7-day trend chart |
| 💧 **Water Tracker** | One-tap hydration logging with 7-day trend chart |
| ⚖️ **BMI Calculator** | Instant BMI calculation with health category |
| 🍽️ **Meal Planner** | Weekly meal planning grid (breakfast/lunch/dinner) |
| 🎯 **Goals** | Create, complete, and track personal health goals |
| 🏆 **Achievements** | Unlockable badges based on user activity |
| 🧘 **Meditation** | Timed guided sessions with animated visuals |
| 🌬️ **Breathing** | Animated box-breathing exercise (4-4-4-4 pattern) |
| 👤 **Profile** | At-a-glance summary of the user's daily stats |
| 🌙 **Dark Mode** | Full theme toggle, persisted across sessions |
| 🔔 **Notifications** | Browser push reminders for hydration & goal milestones |
| 🔊 **Sound Feedback** | Audio cues on key actions (Web Audio API, no external files) |
| 📊 **Data Visualization** | Weekly trend charts via Recharts |

<br/>

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Recharts
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### AI & APIs
- Gemini AI (or the AI service you actually use)
- Web Notifications API
- Web Audio API

### Tools
- Git & GitHub
- VS Code

> **Note:** Food Scanner currently uses a mock nutrition-analysis function
> (`src/pages/FoodScanner.jsx`) to simulate an AI image-recognition API.
> It's structured to be swapped for a real service (e.g. Clarifai, Google
> Vision, or a custom-trained model) without changing the rest of the flow.

<br/>

## 📸 Screenshots

<div align="center">
<i>Add screenshots here — Dashboard, Food Scanner, Dark Mode, Charts, etc.</i>
<br/><br/>

| Dashboard | Water Tracker | Dark Mode |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

</div>

<br/>

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v16 or higher) and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/nanmozhi-25/nutrizen-ai.git
cd nutrizen-ai

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open automatically at `http://localhost:3000`.

<br/>

## 📁 Project Structure

```
nutrizen-ai/
├── public/
│   ├── index.html
│   └── logo.svg
├── src/
│   ├── components/       # Navbar, Sidebar, PageHeader, WeeklyChart
│   ├── pages/             # All feature pages (Dashboard, FoodScanner, etc.)
│   ├── utils/             # storage, sound, notifications, theme, seedData
│   ├── App.js              # Routes & auth guard
│   ├── index.js
│   └── theme.css           # Design tokens (light + dark)
├── package.json
└── README.md
```

<br/>

## 🗺️ Roadmap

- [ ] Connect Food Scanner to a real image-recognition API
- [ ] Add a backend (Node/Express + MongoDB) for real user accounts
- [ ] Deploy to Vercel with a live demo link
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] PWA support for installable mobile experience

<br/>

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo, open an issue, or
submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br/>

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<br/>

## 👤 Author

**Nanmozhi T**
- GitHub: [@your-username](https://github.com/nanmozhi-25)

<br/>

<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub!

</div>
