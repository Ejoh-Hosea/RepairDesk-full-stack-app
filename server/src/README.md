# 🚀 Render Deployment & Backend Testing Guide

---

## PART 1 — RENDER SETUP (Step by Step)

### Step 1 — Push your code to GitHub

You need the code on GitHub before Render can deploy it.

```bash
# Inside the repair-dashboard/ root folder
git init
git add .
git commit -m "Initial commit: RepairDesk full-stack app"

# Create a repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/repair-dashboard.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Create a Render account and new Web Service

1. Go to **https://render.com** → sign up (GitHub login is easiest)
2. Click **"New +"** in the top-right
3. Select **"Web Service"**
4. Click **"Connect a repository"** → authorize Render to access your GitHub
5. Find and select **repair-dashboard**

---

### Step 3 — Configure the Web Service

Fill in these fields on the create screen:

| Field              | Value                                     |
| ------------------ | ----------------------------------------- |
| **Name**           | `repair-dashboard` (or anything you like) |
| **Region**         | Oregon USA (or closest to your users)     |
| **Branch**         | `main`                                    |
| **Root Directory** | _(leave blank)_                           |
| **Runtime**        | `Node`                                    |
| **Build Command**  | `npm run install:all && npm run build`    |
| **Start Command**  | `npm start`                               |
| **Instance Type**  | Free (or Starter $7/mo for always-on)     |

> ⚠️ **Free tier caveat:** The free tier spins down after 15 minutes of inactivity.
> The first request after idle takes ~30 seconds to wake up. Use Starter tier
> for a production shop that can't afford cold starts.

---

### Step 4 — Add Environment Variables

Still on the create screen, scroll to **"Environment Variables"** and add:

| Key          | Value                                   | Notes                                       |
| ------------ | --------------------------------------- | ------------------------------------------- |
| `NODE_ENV`   | `production`                            | Enables prod mode                           |
| `MONGO_URI`  | `mongodb+srv://...`                     | Your full Atlas connection string           |
| `JWT_SECRET` | `abc123...`                             | Your 128-char random secret                 |
| `CLIENT_URL` | `https://repair-dashboard.onrender.com` | Your Render URL (update after first deploy) |

> 💡 You won't know your exact Render URL until after you click "Create Web Service".
> After the first deploy you'll see the URL at the top. Update `CLIENT_URL` then
> click **"Manual Deploy → Deploy latest commit"** to redeploy.

---

### Step 5 — Click "Create Web Service"

Render will:

1. Clone your repo
2. Run `npm run install:all && npm run build` (installs all deps, builds React into `client/dist/`)
3. Run `npm start` (starts Express which serves both the API and the built React app)

Watch the deploy log — a successful deploy looks like:

```
==> Build successful 🎉
==> Starting service with 'npm start'
✅ MongoDB connected: repair-cluster.abc12.mongodb.net
🚀 Server running on port 10000 [production]
```

---

### Step 6 — Get your Deploy Hook URL (needed for GitHub Actions)

1. In your Render service → **"Settings"** tab
2. Scroll to **"Deploy Hook"**
3. Click **"Generate Deploy Hook"**
4. Copy the URL — it looks like:
   ```
   https://api.render.com/deploy/srv-XXXXXXXXXXXXXXXX?key=YYYYYYYY
   ```
5. **Keep this secret** — anyone with this URL can trigger a deploy

---

### Step 7 — Create your first admin user on production

After deploy is live, run this once from your local terminal:

```bash
curl -X POST https://your-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_STRONG_PASSWORD","role":"admin"}'
```

Then **disable the register route** to prevent others from creating accounts:

In `server/src/routes/auth.js`, comment out the last line:

```js
// router.post('/register', authController.register);  // ← comment out after setup
```

Commit and push — the GitHub Actions workflow will redeploy.

---

---

## PART 2 — GITHUB ACTIONS MANUAL DEPLOY

### Step 1 — Add secrets to GitHub

1. Go to your repo on GitHub
2. **Settings → Secrets and variables → Actions → New repository secret**
3. Add these two secrets:

| Secret Name              | Value                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| `RENDER_DEPLOY_HOOK_URL` | The deploy hook URL from Render Step 6 above                          |
| `RENDER_SERVICE_URL`     | Your Render service URL, e.g. `https://repair-dashboard.onrender.com` |

---

### Step 2 — Create a GitHub Environment (optional but recommended)

Environments let you add protection rules like requiring a reviewer before deploy.

1. GitHub → **Settings → Environments → New environment**
2. Name it `production`
3. Optionally add **"Required reviewers"** — you'll be prompted to approve before each deploy

---

### Step 3 — How to trigger a manual deploy

1. Go to your repo on **GitHub.com**
2. Click the **"Actions"** tab
3. In the left sidebar click **"Deploy to Render"**
4. Click **"Run workflow"** (top-right of the workflow table)
5. Fill in:
   - **Target environment:** `production`
   - **Reason:** e.g. `Hotfix for login bug`
6. Click the green **"Run workflow"** button

The workflow will:

- Log who triggered it and why
- Hit your Render deploy hook
- Poll `/api/health` every 15s until the service responds 200 (up to 6 minutes)
- Report success or failure

---

### Step 4 — How to view deploy logs

- In GitHub → Actions → click the running workflow → click the job name
- In Render → your service → **"Logs"** tab (real-time streaming logs)

---

---

## PART 3 — TESTING THE BACKEND INDEPENDENTLY

Use this mode when you want to test API routes without running the React frontend.

### What changes vs normal dev mode

|                | Normal dev           | Backend-only mode          |
| -------------- | -------------------- | -------------------------- |
| Start command  | `npm run dev` (root) | `cd server && npm run dev` |
| Frontend       | Running on :5173     | Not running                |
| CORS           | Allows :5173 only    | Allows all origins         |
| How to hit API | Via Vite proxy       | Directly at :5000          |

---

### Step 1 — Set CORS to allow all origins

In `server/.env`, change:

```env
CORS_ALL_ORIGINS=false
```

to:

```env
CORS_ALL_ORIGINS=true
```

> ⚠️ Only do this locally. Never set this on production.
> It's already blocked by the `!config.isProduction` guard in `env.js`.

---

### Step 2 — Start only the backend

```bash
# From the repair-dashboard/ root:
npm run dev:server

# Or from inside the server/ folder:
cd server
npm run dev
```

You'll see:

```
✅ MongoDB connected: ...
🚀 Server running on port 5000 [development]
```

---

### Step 3 — Seed the database with test data

In a second terminal:

```bash
cd server
npm run seed
```

Output:

```
✅ Connected
👤 Admin user created  →  username: admin  /  password: admin123
✅ Inserted 10 sample repairs
✅ Inserted 10 activity log entries
🎉 Seed complete!
```

---

### Step 4 — Choose your testing tool

#### Option A: VS Code REST Client (recommended — already included)

1. Install the extension: **Ctrl+Shift+X** → search **"REST Client"** → Install
2. Open `docs/api-tests.http` in VS Code
3. Run requests **top to bottom** — login first, copy the token

   After running the Login request, copy `accessToken` from the response:

   ```json
   { "data": { "accessToken": "eyJhbGci..." } }
   ```

   Paste it at the top of the file:

   ```
   @token = eyJhbGci...
   ```

   Now all subsequent requests will be authenticated.

#### Option B: Postman

1. Download from **https://postman.com**
2. Create a new Collection called "RepairDesk"
3. Set a Collection Variable:
   - Name: `baseUrl`
   - Value: `http://localhost:5000/api`
4. Add a request for each endpoint in `docs/api-tests.http`
5. After login, copy the `accessToken` and set it in:
   - Collection → Authorization tab → Bearer Token → paste value
   - Or set `token` as a collection variable and use `{{token}}` in headers

#### Option C: curl (terminal)

```bash
# Login
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -m json.tool

# Save token to shell variable
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# Use token
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/repairs
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/dashboard/trends
```

---

### Step 5 — Switch back to full-stack mode

1. Set `CORS_ALL_ORIGINS=false` in `server/.env`
2. Stop the server (Ctrl+C)
3. From root: `npm run dev` — starts both frontend and backend

The Vite dev server proxies all `/api/*` requests to `:5000` automatically (configured in `client/vite.config.js`), so the React app works as if everything is on the same origin.

---

### Quick reference — the only lines you change

#### To go backend-only:

```
# server/.env
CORS_ALL_ORIGINS=true   ← change this
```

Then: `cd server && npm run dev`

#### To go back to full-stack:

```
# server/.env
CORS_ALL_ORIGINS=false  ← change this back
```

Then (from root): `npm run dev`

That's the **only** change required. No code edits, no rebuilds.

---

---

## PART 4 — ENVIRONMENT VARIABLES REFERENCE

### `server/.env` (local development)

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/repair-dashboard

# Strong random JWT secret (run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_128_char_hex_string

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173

# Server port
PORT=5000

# Environment
NODE_ENV=development

# Set true to allow all CORS origins (backend-only testing mode)
# Never set this to true in production
CORS_ALL_ORIGINS=false
```

### Render environment variables (production)

Set these in Render → Service → Environment:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://your-service-name.onrender.com
```

`CORS_ALL_ORIGINS` is intentionally NOT set in production — it defaults to `false`.

---

## PART 5 — TROUBLESHOOTING

### "Cannot find module" errors on server start

- Make sure you ran `npm run install:all` from the root
- Or `cd server && npm install`

### "MongoServerError: bad auth"

- Your `MONGO_URI` password contains special characters. URL-encode them:
  - `@` → `%40`, `#` → `%23`, `!` → `%21`

### "401 Unauthorized" on all API requests after login

- Your `JWT_SECRET` changed. All previously issued tokens are now invalid.
- Log in again to get a new token.

### CORS error in browser during development

- Make sure `CORS_ALL_ORIGINS=false` and `CLIENT_URL=http://localhost:5173` in `server/.env`
- Make sure Vite dev server is running on port 5173 (not a different port)

### GitHub Actions workflow fails at "Wait for deploy"

- The free Render tier is slow to wake up — increase `MAX_ATTEMPTS` in the workflow from 24 to 30
- Check Render logs for errors (MongoDB connection is the most common cause)

### Render deploy succeeds but site shows blank page

- Check browser console for errors
- Confirm the build ran: Render logs should show `vite build` output and `✓ built in X.Xs`
- Make sure `CLIENT_URL` in Render env matches your exact Render URL (no trailing slash)
