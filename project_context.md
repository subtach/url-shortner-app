# Shortly — URL Shortener & Sharing Platform

## Project Overview
**Shortly** is a full-stack web application that lets users shorten long URLs, share code snippets, and share images — all via short, memorable links with optional QR codes.

---

## Problem Statement
Long URLs are hard to share, remember, and track. Developers also need a quick way to share code snippets and images without heavy third-party platforms. Shortly solves all three in one place.

---

## Key Features

| Feature | Description |
|---|---|
| 🔗 URL Shortener | Convert any long URL into a short link (e.g. `shortly.app/abc123`) |
| ✂️ Custom Aliases | Users can set their own alias (e.g. `shortly.app/my-project`) |
| 📊 Click Tracking | Real-time click count per link |
| ⏳ Link Expiry | Set an expiry date — expired links show a friendly message |
| 📋 Code Paste | Share code snippets with syntax highlighting via short link |
| 🖼️ Image Sharing | Upload and share images (JPEG, PNG, GIF, WebP, SVG, AVIF) via short link |
| 📱 QR Code Generator | Every short link gets a downloadable QR code (SVG) |
| 🗂️ Dashboard | Manage all links — view, copy, and delete |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (React + Node.js) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Database | **Turso** (cloud-hosted SQLite via libSQL) |
| File Storage | **Netlify Blobs** (serverless image storage) |
| Deployment | **Netlify** |
| QR Codes | `qrcode` npm package (SVG output) |

---

## Architecture

```
User Browser
    │
    ▼
Next.js App (Netlify Functions)
    ├── /               → URL Shortener UI
    ├── /paste          → Code Paste UI
    ├── /media          → Image Upload UI
    ├── /dashboard      → Link Management
    ├── /[shortCode]    → Redirect Handler
    ├── /paste/[code]   → Paste Viewer
    └── /media/[code]   → Image Viewer
    │
    ├── Turso DB        → Stores metadata (links, pastes, media)
    └── Netlify Blobs   → Stores actual image files
```

---

## How It Works (URL Shortening)
1. User enters a long URL (+ optional alias & expiry date)
2. Server generates a 6-character random code (or uses custom alias)
3. Record saved to Turso cloud database
4. User gets a short URL + QR code instantly
5. Anyone visiting the short URL is redirected to the original

---

## Deployment
- Hosted on **Netlify** with automatic CI/CD from **GitHub**
- Serverless API routes handled by **Netlify Functions**
- Database hosted on **Turso** (global edge SQLite)

---

## Highlights for PPT
- **3-in-1 platform**: URLs + Code + Images
- **Serverless architecture** — scales automatically, no server to manage
- **Real-time** click analytics
- **QR code generation** for every link
- **Cloud database** (Turso) with global low-latency access
- Clean, responsive UI — works on mobile & desktop
