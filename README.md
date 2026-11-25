# TripMate — Travel Itinerary Planner with Shared Trips & Budget Tracking

TripMate is a full-stack MERN travel itinerary organizer and collaboration platform. It empowers travelers to structure day-by-day travel schedules, collaborate with friends under granular roles (Owner, Editor, Viewer), visualize daily stops on an interactive OpenStreetMap with custom numbered pins, analyze planned expenses with dynamic Recharts analytics, manage packing checklists, and export professional itineraries as downloadable PDFs.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Database Models & Relationships](#database-models--relationships)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [Database Seeding](#database-seeding)
9. [API Overview](#api-overview)
10. [Automated Testing](#automated-testing)
11. [Deployment Guide](#deployment-guide)

---

## Features

- **Robust Authentication & Sessions**: Real JWT authentication with password hashing using `bcryptjs`, HttpOnly cookies, and Bearer token fallback.
- **Automatic Day Generation**: Inclusive travel dates (e.g. Nov 10 to Nov 13 = 4 Days) automatically calculate daily slots with UTC date normalization to prevent timezone drift.
- **Drag-and-Drop Itinerary Planner**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable`. Move activities within a day or across different days with backend order persistence (`PATCH /api/trips/:id/activities/reorder`).
- **Role-Based Collaboration (RBAC)**:
  - **Owner**: Full control (edit trip metadata, invite/remove collaborators, change roles, toggle public sharing, delete trip).
  - **Editor**: Add, edit, delete, and reorder activities; manage packing items.
  - **Viewer**: Read-only access to itinerary, map, budget, and packing checklist.
  - Complete IDOR protection on every route prevents unauthorized document access.
- **Nodemailer Invitation System**: 7-day tokenized invitations sent via SMTP, with a development fallback that logs clickable preview URLs directly to the server console.
- **Public Read-Only Sharing**: Owners can generate unpredictable 16-character `nanoid` share tokens. Anyone with the link can view the daily schedule, map, and budget breakdown without exposing private collaborator emails. Revocation takes effect immediately.
- **Interactive OpenStreetMap with Leaflet**: React Leaflet integration with numbered custom SVG pins matching activity categories, popups with time and costs, and auto-bounds adjustment.
- **Smart Budget Tracker**: MongoDB aggregation pipeline groups activity expenses by category (`Sightseeing`, `Food`, `Accommodation`, etc.) and renders interactive Pie & Bar charts using `recharts`.
- **Packing Checklist**: Real-time progress bar, category filters, item check-off, and persistent state.
- **PDF Itinerary Export**: Server-side document rendering with `PDFKit` streaming directly to browser downloads with branded headers, full day-by-day schedule, budget summary, and packing lists.
- **Cloudinary & Local Storage**: Image uploads handled via Multer, streamed to Cloudinary when configured, or saved locally to `/uploads` with zero configuration needed.

---

## Technology Stack

### Frontend
- **React 18** & **Vite 5**
- **Tailwind CSS 3** with custom warm travel palette:
  - Deep Forest Green (`#234638`)
  - Warm Off-White (`#F8F7F2`)
  - Muted Sage (`#A8B8A0`)
  - Warm Sand (`#E7D8C5`)
  - Charcoal (`#252525`)
- **Redux Toolkit** & **React-Redux**
- **React Router DOM 6**
- **Axios** (centralized API client with interceptors)
- **React Hook Form**
- **@dnd-kit/core** & **@dnd-kit/sortable**
- **React Leaflet** & **Leaflet 1.9**
- **Recharts 2**
- **Lucide React**

### Backend
- **Node.js** (ES Modules)
- **Express.js 4**
- **MongoDB** & **Mongoose 8** (with `mongodb-memory-server` fallback for zero-friction setup and tests)
- **jsonwebtoken** & **bcryptjs**
- **express-validator**
- **Helmet**, **CORS**, **express-rate-limit**, **cookie-parser**, **morgan**
- **Multer** & **Cloudinary SDK**
- **Nodemailer**
- **nanoid**
- **PDFKit**

---

## Folder Structure

```
tripmate/
├── package.json               # Root scripts (concurrent dev, install, seed)
├── .gitignore
├── README.md
│
├── client/                    # Frontend (React 18 + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Button, Input, Modal, Badge, Spinner, EmptyState, ConfirmDialog
│   │   │   ├── layout/        # Navbar, Footer, ProtectedRoute
│   │   │   ├── trips/         # TripCard, TripForm, CollaboratorModal
│   │   │   ├── itinerary/     # DayTabList, ActivityCard, ActivityModal, DayTimeline (dnd-kit)
│   │   │   ├── maps/          # TripMapView (Leaflet)
│   │   │   ├── budget/        # BudgetOverview, BudgetCharts (Recharts)
│   │   │   └── packing/       # PackingList, PackingItemRow
│   │   ├── pages/             # Landing, Login, Register, Dashboard, Trip Details, Public, Invite, 404
│   │   ├── services/          # api, authService, tripService, activityService, budgetService, packingService, inviteService
│   │   ├── store/             # Redux store & authSlice
│   │   ├── hooks/             # useAuth hook
│   │   ├── utils/             # formatters, leafletIcons
│   │   ├── App.jsx            # Router and layout integration
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind directives & Leaflet styling
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                    # Backend (Express REST API)
    ├── src/
    │   ├── config/            # db (Mongo & MemoryServer), cloudinary, mailer
    │   ├── models/            # User, Trip, Activity, Invitation, PackingItem
    │   ├── middleware/        # auth, tripAuth (RBAC & IDOR guards), upload, validate, errorHandler
    │   ├── validators/        # express-validator schemas
    │   ├── controllers/       # auth, trip, activity, invite, budget, packing, pdf
    │   ├── routes/            # auth, trip, activity, invite, public
    │   ├── utils/             # dateUtils, seed script
    │   ├── tests/             # automated test suites (node:test + supertest)
    │   ├── app.js             # Express application assembly
    │   └── server.js          # HTTP listener with graceful shutdown
    ├── uploads/               # Local image storage fallback
    ├── .env.example
    ├── .env
    └── package.json
```

---

## Database Models & Relationships

- **User**: Represents registered travelers (`name`, `email` [unique], `passwordHash`, `avatarUrl`).
- **Trip**: Represents a journey. References `ownerId` -> `User`. Contains an embedded `collaborators` array with references to `User` and their `role` (`editor` | `viewer`). Also stores `shareToken` (sparse unique index) and `isPublic`.
- **Activity**: Day-by-day item belonging to a `Trip` via `tripId`. Stores `dayNumber`, `order`, `title`, `category`, `time`, `location` (`{ name, lat, lng }`), `cost`, and `notes`. A compound index on `{ tripId: 1, dayNumber: 1, order: 1 }` guarantees rapid chronological retrieval and drag-and-drop operations.
- **Invitation**: Tokenized invitations referencing `tripId`. Stores `email`, `role`, `token`, `status`, and `expiresAt` with a MongoDB TTL index for automatic expiration.
- **PackingItem**: Travel essentials linked to `tripId`. Stores `label`, `category`, and `isPacked` status.

When a trip is deleted, associated activities, packing items, and invitations are automatically cascaded.

---

## Prerequisites & Installation

- **Node.js**: Version 18.x, 20.x, or 24.x
- **npm**: Version 9.x or higher
- **MongoDB**: Optional for development (if no local or remote URI is provided, `mongodb-memory-server` launches automatically).

### 1. Clone & Install Dependencies

From the project root:

```bash
# Install root, server, and client dependencies
npm run install:all
```

Or install individually:
```bash
cd server && npm install
cd ../client && npm install
```

---

## Environment Configuration

### Backend (`server/.env`)

```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/tripmate
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Storage (if omitted, uploads save to /uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: SMTP Email Service (if omitted, invites print to console)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@tripmate.io
```

### Frontend (`client/.env`)

```ini
VITE_API_URL=/api
```

---

## Running the Application

### Option A: Run Both Client & Server Concurrently (Recommended)

From the project root:
```bash
npm run dev
```

### Option B: Run Individually

**Terminal 1 (Backend):**
```bash
npm run dev:server
# or
cd server && npm run dev
```
Backend runs at `http://localhost:5000`.

**Terminal 2 (Frontend):**
```bash
npm run dev:client
# or
cd client && npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Database Seeding

TripMate comes with a preconfigured seed script providing realistic itineraries, coordinates, budgets, and packing lists:

```bash
npm run seed
# or
cd server && npm run seed
```

### Demo Accounts Seeded:
1. **Trip Owner**: `alex@tripmate.io` / `Password123!` (Owns "Kyoto Autumn Serenade")
2. **Editor**: `sarah@tripmate.io` / `Password123!` (Editor on Kyoto, Owns "Amalfi Coast")
3. **Viewer**: `marcus@tripmate.io` / `Password123!` (Viewer on Kyoto)

---

## API Overview

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Sign in and receive JWT token & HttpOnly cookie
- `POST /api/auth/logout` — Terminate session
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Trips
- `GET /api/trips` — List owned and shared trips
- `POST /api/trips` — Create a new trip (supports multipart image upload)
- `GET /api/trips/:id` — Get trip details (RBAC checked)
- `PUT /api/trips/:id` — Update trip details & dates (Owner only)
- `DELETE /api/trips/:id` — Cascade delete trip and associated data (Owner only)
- `PATCH /api/trips/:id/share` — Toggle public sharing on/off (Owner only)
- `GET /api/trips/:id/itinerary.pdf` — Stream generated PDF document
- `GET /api/trips/:id/budget` — Aggregated category budget analysis

### Activities
- `POST /api/trips/:id/activities` — Add activity to itinerary (Editor/Owner)
- `GET /api/trips/:id/activities` — List trip activities
- `PATCH /api/trips/:id/activities/reorder` — Reorder / move activities across days
- `PUT /api/activities/:id` — Update activity
- `DELETE /api/activities/:id` — Delete activity and compact orders

### Packing Items
- `GET /api/trips/:id/packing` — List packing checklist & progress stats
- `POST /api/trips/:id/packing` — Add packing item
- `PATCH /api/trips/:id/packing/:itemId` — Toggle or update packing item
- `DELETE /api/trips/:id/packing/:itemId` — Remove packing item

### Collaboration & Invitations
- `POST /api/trips/:id/invites` — Invite collaborator by email
- `GET /api/invites/:token` — Get invitation preview (public)
- `POST /api/invites/:token/accept` — Accept invitation and join trip
- `DELETE /api/trips/:id/collaborators/:userId` — Remove collaborator
- `PATCH /api/trips/:id/collaborators/:userId` — Update collaborator role

### Public Read-Only
- `GET /api/public/trips/:shareToken` — Public view of shared itinerary

---

## Automated Testing

Backend test suites test authentication, authorization guards, IDOR protection, auto-day calculation, activity drag-and-drop ordering, budget aggregations, packing items, public sharing, and PDF export:

```bash
npm run test:server
# or
cd server && npm test
```

Results: **23 passing tests (0 failures)**.

---

## Deployment Guide

### Frontend (Vercel / Netlify)
1. Set root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Configure environment variable: `VITE_API_URL=https://your-backend-domain.com/api`.

### Backend (Render / Railway)
1. Set root directory to `server`.
2. Build command: `npm install`.
3. Start command: `node src/server.js`.
4. Configure environment variables in dashboard:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/tripmate`
   - `JWT_SECRET=<secure_random_string>`
   - `CLIENT_URL=https://your-frontend-domain.com`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
