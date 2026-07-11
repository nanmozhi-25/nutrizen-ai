<div align="center">

<img src="./public/logo.png" alt="NutriZen AI logo" width="90" />

# NutriZen AI

### AI-Powered Nutrition & Meditation Assistant

A full-stack wellness platform that unifies nutrition tracking, hydration and
weight monitoring, meal planning, goal management, mindfulness practices, and
a rule-based recommendation engine into one cohesive application.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## About

NutriZen AI is a full-stack MERN-style application designed to make healthy
living simple and engaging. It combines nutrition tracking, hydration
reminders, weight/BMI monitoring, meal planning, goal management, and guided
mindfulness tools into a single dashboard — backed by a real Node.js/Express
API and a MongoDB Atlas database, with secure JWT authentication.

At its core is a **rule-based recommendation engine** that analyzes each
user's own logged activity (calories, water, goals, BMI) to generate
personalized, scored suggestions — no external AI API, no cost, fully
explainable.

## Features

| Feature | Description |
|---|---|
| Authentication | Secure register/login with JWT tokens and bcrypt password hashing |
| Dashboard | Animated stat cards, trend badges, activity streak, daily insights, and six progress charts |
| Food Scanner | Upload a food photo for an estimated nutrition breakdown and improvement suggestions |
| Food Diary | Chronological log of meals recorded via the Food Scanner |
| Calorie Tracker | Manual & quick-add calorie logging with a 7-day trend chart |
| Water Tracker | One-tap hydration logging, hydration tips, and a 7-day trend chart |
| Weight Tracker | Daily weight logging with an automatic trend chart |
| BMI Calculator | BMI computation with health category and a personalized tip |
| Meal Planner | Weekly meal-planning grid with one-click suggestion chips |
| Goals & Achievements | Create/track goals; unlockable badges reward consistency |
| Meditation & Breathing | Guided timed sessions and a box-breathing exercise |
| Recommendations Engine | Rule-based, scored suggestions across Nutrition, Hydration, Goals, Mindfulness, and Fitness |
| AI Chatbot Assistant | Floating widget answering meal, calorie, sleep, and hydration questions |
| Dark Mode | Full theme toggle, persisted across sessions |
| Notifications | Browser push reminders for hydration & goal milestones |

## Tech Stack

**Frontend:** React 18, React Router 6, Recharts, Lucide React, custom CSS design tokens
**Backend:** Node.js, Express.js, Mongoose
**Database:** MongoDB Atlas
**Auth:** JWT + bcrypt.js

> **Note:** The Food Scanner currently uses a mock nutrition-analysis
> function (`src/pages/FoodScanner.jsx`) to simulate image recognition. It's
> structured to be swapped for a real API (e.g. LogMeal, Google Cloud
> Vision) without changing the rest of the flow. This is a documented,
> intentional trade-off — see the project report for details.

## Project Structure

```
nutrizen-ai/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                 # User, Goal, WaterLog, CalorieLog
│   ├── routes/                 # auth, goals, water, calories
│   ├── middleware/auth.js  # JWT verification
│   ├── server.js               # Express app entry point
│   └── .env.example
├── public/                       # index.html, logo
├── src/
│   ├── components/           # Navbar, Sidebar, charts, chatbot, toast
│   ├── pages/                    # Dashboard, trackers, goals, etc.
│   └── utils/                     # api.js, recommendation engine, chatbot logic
├── .env.example
└── package.json
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v16+ and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

### 1. Clone the repository
```bash
git clone https://github.com/nanmozhi-25/nutrizen-ai.git
cd nutrizen-ai
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env` with your MongoDB connection string and a JWT secret (see
`backend/README.md` for a full MongoDB Atlas setup guide), then start it:
```bash
npm run dev
```

### 3. Set up the frontend
In a new terminal, from the project root:
```bash
npm install
cp .env.example .env
npm start
```
The app opens automatically at `http://localhost:3000`.

## API Reference

All routes except register/login require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get the current logged-in user |
| GET/POST | `/api/goals` | List / create goals |
| PATCH/DELETE | `/api/goals/:id` | Toggle / delete a goal |
| GET/PUT | `/api/water/:date` | Get / update a day's water log |
| GET | `/api/water?days=7` | Weekly water history |
| GET/POST | `/api/calories/:date` | Get / add a day's calorie entries |
| GET | `/api/calories?days=7` | Weekly calorie history |

Full details in [`backend/README.md`](./backend/README.md).

## Roadmap

- [ ] Connect Food Scanner to a real image-recognition API (LogMeal / Google Vision)
- [ ] Deploy backend (Render) and frontend (Vercel) for a live demo
- [ ] Add automated tests (Jest + React Testing Library)
- [ ] Email-based reminders alongside browser push notifications

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

## Author

**Nanmozhi T**
B.Tech — Artificial Intelligence and Data Science
V.S.B Engineering College, Karur

---

<div align="center">If you found this project useful, consider giving it a star.</div>
