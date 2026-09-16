-- ===========================================================================
-- DATABASE SCHEMA: NutriZen AI
-- Target Database: PostgreSQL / MySQL Compatible
-- Description: Core schema design for the wellness, nutrition, and meditation tracker.
-- ===========================================================================

-- 1. Users Table (Core Auth)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table (1-to-1 User Profile)
CREATE TABLE profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INT CHECK (age >= 0),
    gender VARCHAR(50),
    height DECIMAL(5,2) NOT NULL CHECK (height > 0), -- in cm
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0), -- in kg
    bmi DECIMAL(4,1) NOT NULL,
    activity_level VARCHAR(50) CHECK (activity_level IN ('Sedentary', 'Moderate', 'High')),
    dietary_preference VARCHAR(50) CHECK (dietary_preference IN ('Veg', 'Non-Veg', 'Vegan', 'Keto')),
    allergies TEXT[], -- Array of strings (PostgreSQL standard)
    health_goals VARCHAR(50) CHECK (health_goals IN ('Weight Loss', 'Muscle Gain', 'Maintain Health')),
    water_goal INT DEFAULT 2000 CHECK (water_goal > 0), -- in ml
    sleep_goal DECIMAL(3,1) DEFAULT 8.0 CHECK (sleep_goal > 0), -- in hours
    fitness_goal VARCHAR(50) CHECK (fitness_goal IN ('Stay Fit', 'Muscle Gain', 'Weight Loss')),
    meditation_goal INT DEFAULT 15 CHECK (meditation_goal > 0), -- in minutes
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Meals Table (Log food inputs)
CREATE TABLE meals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INT NOT NULL CHECK (calories >= 0),
    protein INT DEFAULT 0 CHECK (protein >= 0), -- in grams
    carbs INT DEFAULT 0 CHECK (carbs >= 0), -- in grams
    fat INT DEFAULT 0 CHECK (fat >= 0), -- in grams
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Water Tracking Table
CREATE TABLE water_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount INT NOT NULL CHECK (amount >= 0), -- logged amount in ml
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, date)
);

-- 5. Sleep Tracking Table
CREATE TABLE sleep_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration DECIMAL(3,1) NOT NULL CHECK (duration >= 0), -- hours slept
    quality VARCHAR(50) NOT NULL CHECK (quality IN ('Excellent', 'Good', 'Restless', 'Poor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Mood Tracking Table
CREATE TABLE mood_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood VARCHAR(50) NOT NULL CHECK (mood IN ('Calm', 'Happy', 'Tired', 'Stressed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fitness Table
CREATE TABLE fitness_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout VARCHAR(255) NOT NULL,
    duration INT NOT NULL CHECK (duration >= 0), -- duration in minutes
    calories_burned INT NOT NULL CHECK (calories_burned >= 0),
    steps INT DEFAULT 0 CHECK (steps >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Goals Table (Checklist task list)
CREATE TABLE goals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Streaks Table
CREATE TABLE streaks (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INT DEFAULT 0 CHECK (best_streak >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_water_user_date ON water_logs(user_id, date);
CREATE INDEX idx_sleep_user_date ON sleep_logs(user_id, date);
CREATE INDEX idx_mood_user_date ON mood_logs(user_id, date);
CREATE INDEX idx_fitness_user_date ON fitness_logs(user_id, date);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
