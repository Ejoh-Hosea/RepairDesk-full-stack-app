# 🔧 RepairDesk

A full-stack phone repair business management dashboard

**Stack:** React · Redux Toolkit · Tailwind CSS · Node.js · Express · MongoDB · JWT Auth

---

## 📚 Documentation

| File                   | Contents                                                                   |
| ---------------------- | -------------------------------------------------------------------------- |
| `README.md`            | Project overview, quick start, API reference                               |
| `docs/RENDER_SETUP.md` | Step-by-step Render deployment, GitHub Actions setup, backend-only testing |
| `docs/api-tests.http`  | VS Code REST Client test suite for all API routes                          |

---

## 📁 Project Structure

```
repair-dashboard/              ← root (single Render deployment)
├── client/                    ← React frontend (Vite)
│   ├── src/
│   │   ├── app/               ← Redux store
│   │   ├── features/          ← auth / repairs / dashboard slices
│   │   ├── components/        ← reusable UI components
│   │   ├── pages/             ← route-level pages
│   │   ├── services/          ← axios API layer
│   │   ├── layouts/           ← ProtectedLayout (auth guard)
│   │   └── utils/             ← formatters, constants
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                    ← Node/Express backend
│   └── src/
│       ├── config/            ← DB connection, env loader
│       ├── models/            ← Mongoose schemas
│       ├── services/          ← business logic
│       ├── controllers/       ← request handlers
│       ├── routes/            ← Express routers
│       ├── middleware/        ← auth, error handler, validation
│       ├── cache/             ← in-memory cache (node-cache)
│       └── utils/             ← AppError, asyncHandler, tokenUtils
├── render.yaml                ← Render deployment config
├── package.json               ← root scripts (concurrently)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (see setup below)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd repair-dashboard
npm run install:all
```

### 2. Set up environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your values (see the MongoDB and JWT sections below).

### 3. Run development servers

```bash
# From the root folder — runs both client and server concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 4. Seed the database

```bash
cd server
npm run seed
```

This creates an admin user (`admin` / `admin123`) and 10 sample repairs so the dashboard has data immediately. Change the password after first login.

> All future users are created from inside the app — **Dashboard → Users page** (admin only).

---

## 🍃 MongoDB Atlas Setup (Step by Step)

### Step 1 — Create a free cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in
2. Click **"Build a Database"**
3. Choose **"M0 Free"** (no credit card needed)
4. Select a cloud provider (AWS recommended) and a region close to you
5. Name your cluster (e.g. `repair-cluster`) and click **"Create"**

### Step 2 — Create a database user

1. In the left sidebar click **"Database Access"**
2. Click **"+ Add New Database User"**
3. Choose **"Password"** authentication
4. Set a username (e.g. `repairapp`) and a strong password — **save this password**
5. Under "Built-in Role" select **"Read and write to any database"**
6. Click **"Add User"**

### Step 3 — Whitelist your IP address

1. In the left sidebar click **"Network Access"**
2. Click **"+ Add IP Address"**
3. For development: click **"Add Current IP Address"**
4. For Render deployment: click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   > This is required because Render uses dynamic IPs. Safe since your credentials are required.
5. Click **"Confirm"**

### Step 4 — Get your connection string

1. In the left sidebar click **"Database"**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** driver, version **5.5 or later**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Add your database name before the `?`:
   ```
   mongodb+srv://repairapp:yourpassword@repair-cluster.abc12.mongodb.net/repair-dashboard?retryWrites=true&w=majority
   ```

### Step 5 — Add to your .env

```env
MONGO_URI=mongodb+srv://repairapp:yourpassword@repair-cluster.abc12.mongodb.net/repair-dashboard?retryWrites=true&w=majority
```

---

## 🔑 JWT Secret Setup

Generate a strong secret (run this in your terminal):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add it to your `.env`:

```env
JWT_SECRET=paste_your_generated_secret_here
```

> ⚠️ Never commit this to git. Never share it. If leaked, rotate it immediately.

---

## ☁️ Render Deployment (Single Service)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/repair-dashboard.git
git push -u origin main
```

### Step 2 — Create a Render Web Service

1. Go to [https://render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your repository
4. Render will detect the `render.yaml` file automatically

### Step 3 — Configure the service

If not using `render.yaml` autodeploy, set manually:

| Setting           | Value                                  |
| ----------------- | -------------------------------------- |
| **Name**          | `repair-dashboard`                     |
| **Environment**   | `Node`                                 |
| **Region**        | Oregon (or closest to you)             |
| **Branch**        | `main`                                 |
| **Build Command** | `npm run install:all && npm run build` |
| **Start Command** | `npm start`                            |

### Step 4 — Add environment variables in Render

In your Render service dashboard → **"Environment"** → add these:

| Key          | Value                                     |
| ------------ | ----------------------------------------- |
| `NODE_ENV`   | `production`                              |
| `MONGO_URI`  | Your full MongoDB Atlas connection string |
| `JWT_SECRET` | Your generated 128-char hex secret        |
| `CLIENT_URL` | `https://your-service-name.onrender.com`  |

> 💡 `CLIENT_URL` should be your Render service URL. You'll know it after first deploy — update it then redeploy.

### Step 5 — Deploy

1. Click **"Create Web Service"**
2. Render will run the build command (installs deps + builds React)
3. First deploy takes 3–5 minutes
4. Watch the logs — look for:
   ```
   ✅ MongoDB connected: ...
   🚀 Server running on port 10000 [production]
   ```

### Step 6 — Seed your production database

After deploy is live, run the seed script from your local machine pointing at the production DB.
The easiest way: temporarily add `MONGO_URI` to your local `server/.env` pointing at the production
Atlas cluster, then run:

```bash
cd server
npm run seed
```

This creates `admin` / `admin123`. Log in immediately and go to **Users** to create a proper account,
then delete the seeded admin if you want, or just change its password.

> Alternatively, use MongoDB Atlas UI → Browse Collections → insert a User document manually.

---

## 🔒 Security Checklist Before Going Live

- [ ] `JWT_SECRET` is a long random string (64+ bytes)
- [ ] MongoDB password is strong and unique
- [ ] MongoDB Network Access allows `0.0.0.0/0` for Render
- [ ] `NODE_ENV=production` is set in Render
- [ ] First login password changed from seed default (`admin123`)
- [ ] No `.env` file is committed to git (check `.gitignore`)

---

## 📡 API Reference

| Method | Endpoint                  | Auth    | Description                                             |
| ------ | ------------------------- | ------- | ------------------------------------------------------- |
| POST   | `/api/auth/login`         | ✗       | Login, returns tokens                                   |
| POST   | `/api/auth/refresh`       | ✗       | Refresh access token                                    |
| POST   | `/api/auth/logout`        | ✓       | Logout, clears tokens                                   |
| GET    | `/api/auth/me`            | ✓       | Get current user                                        |
| GET    | `/api/repairs`            | ✓       | List repairs (supports `?status=&search=&page=&limit=`) |
| POST   | `/api/repairs`            | ✓       | Create repair                                           |
| PUT    | `/api/repairs/:id`        | ✓       | Update repair                                           |
| DELETE | `/api/repairs/:id`        | ✓       | Delete repair                                           |
| GET    | `/api/dashboard`          | ✓       | Stats (today's repairs, revenue, profit, top issues)    |
| GET    | `/api/dashboard/trends`   | ✓       | Last 7 days repair + revenue trends                     |
| GET    | `/api/dashboard/activity` | ✓       | Recent activity feed                                    |
| GET    | `/api/users`              | ✓ admin | List all users                                          |
| POST   | `/api/users`              | ✓ admin | Create a new user                                       |
| PATCH  | `/api/users/:id/role`     | ✓ admin | Change user role                                        |
| PATCH  | `/api/users/:id/password` | ✓ admin | Reset user password                                     |
| DELETE | `/api/users/:id`          | ✓ admin | Delete a user                                           |
| GET    | `/api/health`             | ✗       | Health check                                            |

---

## 🧩 Common Issues

**"MongoDB connection failed"**

- Check your `MONGO_URI` is correct and the password has no special characters that need URL-encoding
- Ensure your IP is whitelisted in MongoDB Atlas Network Access

**"Invalid token" on all requests**

- Your `JWT_SECRET` changed — all existing tokens are invalidated. Users need to log in again.

**Blank page after deploy**

- Check Render build logs for errors
- Confirm `client/dist` was built (`npm run build` in root)
- Ensure `CLIENT_URL` in Render env matches your actual Render URL

**"Too many login attempts" error**

- Rate limiting is active (10 attempts per 15 min). Wait 15 minutes or restart the server.

---

## 🛠️ Scripts

| Command                     | Description                           |
| --------------------------- | ------------------------------------- |
| `npm run dev`               | Run client + server concurrently      |
| `npm run dev:server`        | Run server only                       |
| `npm run dev:client`        | Run client only                       |
| `npm run build`             | Build client (Vite)                   |
| `npm start`                 | Start production server               |
| `npm run install:all`       | Install all dependencies              |
| `cd server && npm run seed` | Seed DB with admin user + sample data |
