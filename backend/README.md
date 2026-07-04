# NutriZen AI — Backend

Real Node.js/Express API with MongoDB, JWT authentication, and password
hashing. Replaces the localStorage-only version for Auth, Goals, Water, and
Calorie tracking.

<br/>

## 1. Create a free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. Create a new **free (M0) cluster** — any provider/region is fine.
3. Under **Database Access**, create a database user (username + password —
   save these, you'll need them).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from
   Anywhere** (`0.0.0.0/0`) — simplest for development/deployment.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your actual database user
   credentials, and add `/nutrizen` before the `?` so it saves to a database
   named `nutrizen`:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/nutrizen?retryWrites=true&w=majority
   ```

<br/>

## 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — the connection string from step 1
- `JWT_SECRET` — any long random string (e.g. generate one at
  https://randomkeygen.com, or just mash your keyboard for 40+ characters)

<br/>

## 3. Install & run locally

```bash
npm install
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

Test it's alive: open http://localhost:5000 in your browser — you should
see `{"status":"NutriZen AI API running"}`.

<br/>

## 4. API Reference

All routes except register/login require a header:
`Authorization: Bearer <token>` (token returned from register/login).

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Returns current logged-in user |
| GET | `/api/goals` | List all goals for the user |
| POST | `/api/goals` | `{ text }` → creates a goal |
| PATCH | `/api/goals/:id` | Toggles a goal's done status |
| DELETE | `/api/goals/:id` | Deletes a goal |
| GET | `/api/water/:date` | Get water log for a date (`YYYY-MM-DD`) |
| PUT | `/api/water/:date` | `{ glasses, goal }` → upserts water log |
| GET | `/api/water?days=7` | Last N days of water logs |
| GET | `/api/calories/:date` | Get calorie log for a date |
| POST | `/api/calories/:date` | `{ food, calories }` → adds an entry |
| PUT | `/api/calories/:date/goal` | `{ goal }` → updates daily calorie goal |
| GET | `/api/calories?days=7` | Last N days of calorie logs |

<br/>

## 5. Deploying the backend (Render — free tier)

1. Push this `backend` folder to a GitHub repo (can be the same repo as the
   frontend, or a separate one).
2. Go to https://render.com → sign up/login with GitHub.
3. **New** → **Web Service** → connect your repo.
4. Settings:
   - **Root Directory:** `backend` (if it's in the same repo as frontend)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (same as your `.env`): `MONGO_URI`,
   `JWT_SECRET`, `CLIENT_URL` (set this to your deployed frontend URL once
   you have it).
6. Deploy. Render gives you a URL like `https://nutrizen-api.onrender.com`
   — this is your `REACT_APP_API_URL` for the frontend.

> **Note:** Free Render services sleep after inactivity and take ~30s to
> wake up on the first request. This is normal for free tier.
