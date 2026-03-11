---
description: how to run the URL shortener web app locally
---

# Run URL Shortener Locally

// turbo-all

## Prerequisites
Ensure Node.js (v20+) and pnpm are installed. Verify:
```
node --version
pnpm --version
```

## 1. Install dependencies (first time only)
```
pnpm install
```
> If pnpm is not found, use `npm install --legacy-peer-deps` instead.

## 2. Start the development server
```
pnpm dev
```
> The app starts at **http://localhost:3000**

## 3. Verify the API is working
Open a browser or run the following:

- **Home page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **List all links**: http://localhost:3000/api/links
- **Shorten a URL** (POST): `POST /api/shorten` with body `{ "url": "https://example.com" }`
- **QR code image**: http://localhost:3000/api/qr?url=https://example.com

## 4. Test a short link redirect
1. Shorten a URL on the home page
2. Click the generated short link (e.g. `http://localhost:3000/abc123`)
3. You should be redirected to the original URL

## Notes
- The SQLite database (`links.db`) is auto-created in the project root on first run
- Sample links are seeded automatically when the DB is empty
- Links persist across server restarts (stored in `links.db`)
- To reset the database, delete `links.db` and restart the server
