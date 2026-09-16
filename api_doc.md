# API Routing Structure & Specifications: NutriZen AI

This document specifies the backend REST API structure for a full production implementation of **NutriZen AI**. 

- **Base URL**: `https://api.nutrizen.com/v1`
- **Headers Required**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_token>` (for all endpoints except public authentication)

---

## 1. Authentication Endpoints

### Post Registration
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "name": "Zen Practitioner",
    "email": "practitioner@zen.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": "u_987213",
      "name": "Zen Practitioner",
      "email": "practitioner@zen.com",
      "role": "user"
    }
  }
  ```

### Post Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "practitioner@zen.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": "u_987213",
      "name": "Zen Practitioner",
      "email": "practitioner@zen.com",
      "role": "user"
    }
  }
  ```

### Post Reset Code & Password
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Auth**: None
- **Request Body**:
  ```json
  { "email": "practitioner@zen.com" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Verification code dispatched to email." }
  ```

- **URL**: `/auth/reset-password`
- **Method**: `POST`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "practitioner@zen.com",
    "code": "ZEN777",
    "newPassword": "newsecurepassword456"
  }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Password updated successfully." }
  ```

---

## 2. User Profile Endpoints

### Get / Update Profile Details
- **URL**: `/profile`
- **Method**: `GET`
- **Auth**: Required
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "age": 28,
      "gender": "Non-binary",
      "height": 175,
      "weight": 68,
      "bmi": 22.2,
      "activityLevel": "Moderate",
      "dietaryPreference": "Veg",
      "allergies": ["Peanuts"],
      "healthGoals": "Maintain Health",
      "waterGoal": 2500,
      "sleepGoal": 8.0,
      "fitnessGoal": "Stay Fit",
      "meditationGoal": 15
    }
  }
  ```

- **URL**: `/profile`
- **Method**: `PUT`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "age": 29,
    "height": 175,
    "weight": 70,
    "activityLevel": "High",
    "dietaryPreference": "Veg",
    "allergies": ["Peanuts", "Gluten"],
    "healthGoals": "Muscle Gain"
  }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Profile parameters updated.", "bmi": 22.9 }
  ```

---

## 3. Meal Tracking Endpoints

### Get Today's Logged Meals
- **URL**: `/meals`
- **Method**: `GET`
- **Auth**: Required
- **Query Params**: `date=YYYY-MM-DD`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "meals": [
      {
        "id": "m_10294",
        "name": "Avocado Toast & Egg Scramble",
        "calories": 420,
        "protein": 18,
        "carbs": 32,
        "fat": 22,
        "mealType": "Breakfast",
        "date": "2026-06-23"
      }
    ]
  }
  ```

### Log a Meal
- **URL**: `/meals`
- **Method**: `POST`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "name": "Quinoa Tofu Buddha Bowl",
    "calories": 580,
    "protein": 22,
    "carbs": 75,
    "fat": 18,
    "mealType": "Lunch",
    "date": "2026-06-23"
  }
  ```
- **Response (201 Created)**:
  ```json
  { "success": true, "id": "m_88291", "message": "Meal entry logged." }
  ```

### Delete a Logged Meal
- **URL**: `/meals/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Meal entry removed." }
  ```

---

## 4. Tracking logs (Hydration, Sleep, Mood, Fitness)

### Water Intake
- **URL**: `/tracker/water`
- **Method**: `POST`
- **Auth**: Required
- **Request Body**:
  ```json
  { "amount": 250, "date": "2026-06-23" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "amountToday": 1750 }
  ```

### Sleep Duration
- **URL**: `/tracker/sleep`
- **Method**: `POST`
- **Auth**: Required
- **Request Body**:
  ```json
  { "duration": 8.0, "quality": "Excellent", "date": "2026-06-23" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Sleep cycle logged." }
  ```

### Mood Journal
- **URL**: `/tracker/mood`
- **Method**: `POST`
- **Auth**: Required
- **Request Body**:
  ```json
  { "mood": "Calm", "notes": "Completed breathing loops.", "date": "2026-06-23" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Mood journal entry saved." }
  ```

---

## 5. Goals Checklist Endpoints

### Get Goals
- **URL**: `/goals`
- **Method**: `GET`
- **Auth**: Required
- **Response (200 OK)**:
  ```json
  [
    { "id": "g1", "text": "Drink 2.5L Clean Water", "completed": false },
    { "id": "g2", "text": "15 Minutes Meditation Prep", "completed": true }
  ]
  ```

### Complete/Toggle Goal
- **URL**: `/goals/:id/toggle`
- **Method**: `PATCH`
- **Auth**: Required
- **Response (200 OK)**:
  ```json
  { "success": true, "id": "g1", "completed": true }
  ```
