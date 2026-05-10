# 🚀 Render Deployment Guide — RepairDesk

Deploy the full RepairDesk application (React + Node.js + MongoDB) as a
single service on Render. The frontend is built by Vite and served by
Express from the same deployment.

---

## How it works

```
GitHub repo (repair-dashboard)
         │
         │  GitHub Actions — manual trigger
         ▼
    Render Service
         │
         ├── npm run install:all    (installs root + client + server deps)
         ├── npm run build          (vite builds React into client/dist/)
         └── npm start              (Express serves API + React from same port)
                  │
                  ├── /api/*        → Express routes
                  └── /*            → serves client/dist/index.html (React SPA)
```

Express serves the React build directly — no separate frontend hosting needed.
This is controlled by `DEPLOYMENT_TARGET=render` in the environment variables.

---

## Prerequisites

- Render account — https://render.com (free)
- MongoDB Atlas M0 cluster (free) — https://cloud.mongodb.com
- Your code pushed to GitHub

---

## STEP 1 — Push to GitHub

```bash
# From repair-dashboard/ root
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/repair-dashboard.git
git branch -M main
git push -u origin main
```

---

## STEP 2 — Create a Render Web Service

1. Go to **https://render.com** → sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub account → select **repair-dashboard**
4. Render detects `render.yaml` automatically — confirm the settings:

| Setting       | Value                                  |
| ------------- | -------------------------------------- |
| Name          | `repair-dashboard`                     |
| Region        | Oregon (or closest to you)             |
| Branch        | `main`                                 |
| Build Command | `npm run install:all && npm run build` |
| Start Command | `npm start`                            |
| Instance Type | Free                                   |

---

## STEP 3 — Add Environment Variables

In the Render service → **Environment** tab → add these:

| Key                 | Value                                    |
| ------------------- | ---------------------------------------- |
| `NODE_ENV`          | `production`                             |
| `DEPLOYMENT_TARGET` | `render`                                 |
| `MONGO_URI`         | Your Atlas connection string             |
| `JWT_SECRET`        | Your generated secret                    |
| `CLIENT_URL`        | `https://your-service-name.onrender.com` |

> ⚠️ You won't know your Render URL until after the first deploy.
> After it's live, copy the URL from the Render dashboard, add it as
> `CLIENT_URL`, then redeploy once.

**Generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## STEP 4 — Deploy

Click **Create Web Service**. Render will:

1. Clone your repo
2. Run `npm run install:all && npm run build`
3. Run `npm start`

Watch the deploy logs. A successful deploy looks like:

```
✅ MongoDB connected: cluster.abc.mongodb.net
🚀 Server running on port 10000 [production]
📦 Serving React frontend from client/dist (Render mode)
```

First deploy takes **3–5 minutes**.

---

## STEP 5 — Seed the database

After deploy is live, run this once from your local machine:

```bash
cd server
MONGO_URI="your_atlas_connection_string" npm run seed
```

Creates:

- Admin user: `admin` / `admin123`
- 10 sample repairs with realistic dates

**Log in at your Render URL and change the password immediately.**

---

## STEP 6 — Get the Deploy Hook URL

This is what GitHub Actions uses to trigger deploys.

1. Render dashboard → your service → **Settings** tab
2. Scroll to **Deploy Hook**
3. Click **Generate Deploy Hook**
4. Copy the URL — looks like:
   ```
   https://api.render.com/deploy/srv-XXXXXXXX?key=YYYYYYYY
   ```

---

## STEP 7 — Set up GitHub Actions

Go to your **GitHub repo → Settings → Secrets and variables → Actions**
and add these two secrets:

| Secret                   | Value                                                                |
| ------------------------ | -------------------------------------------------------------------- |
| `RENDER_DEPLOY_HOOK_URL` | The deploy hook URL from Step 6                                      |
| `RENDER_SERVICE_URL`     | Your Render service URL e.g. `https://repair-dashboard.onrender.com` |

---

## STEP 8 — Trigger a deploy from GitHub Actions

1. Go to your repo on **GitHub.com**
2. Click **Actions** tab
3. Click **Deploy to Render** in the left sidebar
4. Click **Run workflow** → fill in reason → click green **Run workflow**

The pipeline will:

- Trigger the Render deploy hook
- Wait 90 seconds for the build to start
- Poll `/api/health` every 20 seconds for up to 8 minutes
- Report success when the service responds 200

---

## Environment Variables Reference

### `server/.env` (local development only)

```env
MONGO_URI=mongodb+srv://repairapp:PASSWORD@cluster.mongodb.net/repair-dashboard
JWT_SECRET=your_128_char_hex_secret
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
DEPLOYMENT_TARGET=
CORS_ALL_ORIGINS=false
```

### Render dashboard (production)

```
NODE_ENV=production
DEPLOYMENT_TARGET=render
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://your-service-name.onrender.com
```

---

## ⚠️ Free Tier Caveat

Render's free tier **spins down after 15 minutes of inactivity**.
The first request after idle takes ~30 seconds to wake up.

For a production shop that can't have cold starts, upgrade to
**Starter ($7/month)** which keeps the service always on.

---

## Troubleshooting

**Build fails: `client/dist not found`**

- Check that `npm run build` ran successfully in the Render logs
- Verify `DEPLOYMENT_TARGET=render` is set in environment variables

**Login fails after deploy**

- Make sure `CLIENT_URL` matches your exact Render URL
- No trailing slash — `https://repair-dashboard.onrender.com` not `https://repair-dashboard.onrender.com/`

**GitHub Actions times out waiting for health**

- Render free tier is slow — the 8-minute window covers most cases
- Check Render deploy logs directly for errors

**MongoDB connection failed**

- Verify `MONGO_URI` has no typos
- Check Atlas Network Access allows `0.0.0.0/0`
- Render uses dynamic IPs — static IP whitelisting won't work

**`Too many login attempts` error**

- Rate limiting is active (10 attempts per 15 min)
- Wait 15 minutes or restart the Render service

---

## File Structure Relevant to Render

```
repair-dashboard/
├── render.yaml                  ← Render auto-config (build + start commands)
├── package.json                 ← root scripts: install:all, build, start
├── .github/
│   └── workflows/
│       └── deploy.yml           ← GitHub Actions manual deploy pipeline
├── client/
│   └── dist/                    ← built by vite, served by Express on Render
└── server/
    └── src/
        ├── app.js               ← serves client/dist when DEPLOYMENT_TARGET=render
        └── config/env.js        ← reads DEPLOYMENT_TARGET from environment
```
