---
description: how to deploy the URL shortener app to Netlify
---

# Deploy URL Shortener to Netlify

## Prerequisites
1. A [Turso](https://turso.tech) account with a database created
2. A [Netlify](https://netlify.com) account
3. The code pushed to a GitHub repository

## Step 1 — Create a Turso database
1. Sign up at [turso.tech](https://turso.tech) (free)
2. Create a new database (name it `url-shortener` or anything you like)
3. In your database dashboard, click **Generate Token** and copy both:
   - **Database URL**: `libsql://your-db-name-username.turso.io`
   - **Auth Token**: `eyJ...` (long JWT string)
4. Create a `.env.local` file in the project root for local testing:
```
TURSO_DATABASE_URL=libsql://your-db-name-username.turso.io
TURSO_AUTH_TOKEN=eyJ...
```

## Step 2 — Test locally with Turso
```bash
npm run dev
```
Open http://localhost:3000 and shorten a URL. The app now reads/writes to your Turso cloud database.

## Step 3 — Push to GitHub
```bash
git add .
git commit -m "Add Netlify deployment with Turso"
git push
```

## Step 4 — Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Pick your GitHub repository
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Before deploying, go to **Site settings → Environment Variables** and add:
   - `TURSO_DATABASE_URL` = your database URL
   - `TURSO_AUTH_TOKEN` = your auth token
5. Click **Deploy site**

## Step 5 — Verify the deployment
- Visit your Netlify URL (e.g. `https://your-site.netlify.app`)
- Shorten a URL — it should persist to Turso
- Try the short link redirect
- Test the QR code: `https://your-site.netlify.app/api/qr?url=https://example.com`

## Notes
- `netlify.toml` is already configured with `@netlify/plugin-nextjs`
- The Turso database is shared between local dev and production — use separate databases if you want isolated environments
- Links created locally will appear on the deployed site (same Turso database)
