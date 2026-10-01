# SkyBook ✈️ — Airline Reservation & Fleet Management System

A modern, full-stack airline reservation and operations platform built with **React**, **Vite**, **Express**, and **Node.js**. SkyBook provides an end-to-end flight booking journey for passengers—from flight search, interactive cabin seat selection, dynamic pricing, and simulated checkout to downloadable PDF e-tickets—along with a comprehensive administrative suite for aircraft, flight, schedule, and passenger operations.

---

## 📌 Table of Contents
- [Key Features](#-key-features)
  - [Passenger Experience](#passenger-experience)
  - [Admin Operations](#admin-operations)
- [Tech Stack](#-tech-stack)
- [Demo Credentials](#-demo-credentials)
- [System Architecture](#-system-architecture)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started Locally](#-getting-started-locally)
- [Free Cloud Deployment (Render)](#-free-cloud-deployment-render)
  - [Method 1: Automatic Blueprint (Recommended)](#method-1-automatic-blueprint-recommended)
  - [Method 2: Manual Web Service Setup](#method-2-manual-web-service-setup)
  - [Keeping the Free Instance Awake 24/7](#keeping-the-free-instance-awake-247)
- [Database Options & Extensibility](#-database-options--extensibility)
- [License](#-license)

---

## ✨ Key Features

### Passenger Experience
- 🔍 **Flight Search & Filtering**: Query flights by origin, destination, date, airline, price range, and status.
- 💺 **Interactive Cabin Seat Map**: Visual cabin grid with distinct seat tiers (First, Business, Premium Economy, Economy) and positions (Window, Aisle, Middle).
- 🏷️ **Dynamic Fare Calculation**: Transparent fare breakdown accounting for base airline price, cabin multiplier, seat position surcharge, and taxes (18% GST).
- 👥 **Batch Multi-Passenger Bookings**: Reserve multiple seats simultaneously under a shared group booking reference (`SB-GRP...`).
- 💳 **Simulated Payment Gateway**: Flexible payment flow (UPI, Credit/Debit card, Net Banking) confirming bookings with instant receipt generation.
- 📄 **Official PDF E-Ticket Download**: Native PDF ticket generator producing printable boarding passes with passenger details, barcode/ticket number, and route information.
- 📈 **Personal Travel Analytics**: Tracks visited destinations, favorite cities, booking history, and upcoming trips.
- 🎮 **Aviation Mini-Game**: Interactive flight mini-game on the landing page for user engagement.

### Admin Operations
- 🛫 **Fleet & Aircraft Management**: Create and configure aircraft models with custom seating capacities; automatically generates compliant cabin seat maps.
- 📅 **Flight & Schedule Dispatch**: Schedule flights across routes with real-time seat inventory tracking.
- 💺 **Seat Inventory Oversight**: Inspect seat availability, seat classes, and occupied status across any aircraft or scheduled flight.
- 📋 **Passenger & Booking Audit**: Review all active, confirmed, and cancelled reservations with full passenger manifesting.
- 👥 **User Role Management**: Manage user profiles and elevate permissions (Passenger User vs. Fleet Admin).

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS / Modern CSS, Lucide React Icons |
| **Backend** | Node.js (v20+ / v22), Express 4, TypeScript (`tsx`) |
| **PDF Engine** | Native Node.js PDF-1.4 Stream Generator (Zero external binary dependencies) |
| **State & Auth** | Bearer Token Auth, Session Storage, Role-Based Access Control (RBAC) |
| **Deployment** | Render Blueprint (`render.yaml`), Docker-ready, Node.js single-process server |

---

## 🔑 Demo Credentials

SkyBook includes pre-seeded demonstration accounts ready for immediate testing:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@skybook.com` | `admin123` | Full access: Fleet, Aircraft, Schedules, Flights, User Management, Bookings Audit |
| **User** | `user@skybook.com` | `user123` | Passenger portal: Search, Booking flow, Seat selection, Ticket download, Travel History |

*(You can also register a brand-new user account directly from the login/registration modal.)*

---

## 🏗️ System Architecture

SkyBook is architected as a **unified full-stack application**. In development, Express mounts Vite middlewares for rapid hot reload; in production, Express delivers compiled static assets alongside high-performance REST API endpoints.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                     │
│  React 18 SPA · Lucide Icons · Interactive Seat Grid   │
└───────────────────────────┬────────────────────────────┘
                            │ /api/* requests & PDF downloads
                            ▼
┌────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (server.ts)                │
│  Port 3000 (0.0.0.0) · JWT-compatible Auth Middleware   │
├───────────────────────────┬────────────────────────────┤
│   REST API Controllers    │    Vite SPA Middleware     │
│   - /api/auth             │    (Dev mode) OR           │
│   - /api/flights          │    Static /dist file serve │
│   - /api/schedules        │    (Production mode)       │
│   - /api/bookings         │                            │
│   - /api/seats            │    PDF Ticket Generator    │
│   - /api/tickets          │    - Native PDF-1.4 buffer │
│   - /api/travel-history   │    - Direct binary stream  │
└───────────────────────────┴────────────────────────────┘
```

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` — Create new account (returns token and user profile)
- `POST /api/auth/login` — Sign in with email and password

### Flights & Schedules
- `GET /api/flights` — List all configured flights
- `GET /api/flights/search?source=&destination=&departureDate=&airline=` — Search flights by criteria
- `POST /api/flights` — Create a new flight route *(Admin)*
- `PUT /api/flights/:id` — Update flight details *(Admin)*
- `DELETE /api/flights/:id` — Remove flight *(Admin)*
- `GET /api/schedules` — List schedules with enriched flight details
- `POST /api/schedules` — Dispatch a new schedule *(Admin)*
- `PUT /api/schedules/:id` — Update schedule *(Admin)*
- `DELETE /api/schedules/:id` — Cancel schedule *(Admin)*

### Aircraft & Seats
- `GET /api/aircrafts` — List all aircraft in fleet
- `POST /api/aircrafts` — Register aircraft & auto-generate seat layout *(Admin)*
- `GET /api/seats/availability/:scheduleId` — Real-time seat occupancy for a flight schedule
- `GET /api/seats/aircraft/:aircraftId` — View cabin layout for an aircraft

### Bookings & Payments
- `GET /api/bookings` — Fetch current user bookings (or all bookings if Admin)
- `POST /api/bookings/batch` — Reserve multiple seats with passenger records
- `PATCH /api/bookings/:id/cancel` — Cancel a booking and release seat back to inventory
- `POST /api/payments` — Process payment and confirm booking
- `POST /api/payments/batch` — Process batch payment for group reservations
- `GET /api/payments/history` — Payment records and transaction receipts

### Tickets & Travel History
- `GET /api/tickets` — View issued boarding tickets
- `GET /api/tickets/:id/download` — Download official printable PDF boarding ticket
- `GET /api/travel-history/user/:userId` — Completed and upcoming travel history
- `GET /api/travel-history/statistics/:userId` — Summary stats (visited cities, favorite destinations)

### System
- `GET /health` — Health check endpoint for uptime monitors and container orchestration

---

## 📂 Project Structure

```
.
├── server.ts                    # Full-stack Express server, API routes, PDF engine
├── render.yaml                  # 1-click Render blueprint specification
├── package.json                 # Unified dependencies & NPM scripts
├── vite.config.ts               # Vite configuration
├── index.html                   # HTML5 entry with metadata
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application container, session state, navigation
│   ├── styles.css               # Global styling & layout rules
│   ├── lib/
│   │   ├── api.js               # Universal fetch wrapper with Bearer token injection
│   │   ├── utils.js             # Formatting, validation, and seat parsing utilities
│   │   └── constants.js         # Cabin pricing rules, role definitions, and form schemas
│   └── components/
│       ├── admin/               # Fleet view, aircraft CRUD, schedule dispatch, user admin
│       ├── auth/                # Sign-in & sign-up modal
│       ├── bookings/            # Cabin seat map, price breakdown, passenger forms, checkout
│       ├── common/              # Header, reusable DataTable, form Fields
│       ├── flights/             # Flight search engine & schedule cards
│       ├── landing/             # Hero banner, quick flight search, aviation mini-game
│       ├── layout/              # Collapsible sidebar, navigation config
│       ├── payments/            # Transaction history & receipts
│       ├── profile/             # User settings & travel statistics
│       └── tickets/             # Ticket cards & direct PDF download triggers
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher, recommended v20+)
- **npm** (v9.0.0 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/skybook.git
   cd skybook
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the unified development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Build & Local Test
To verify the production build locally:
```bash
npm run build
npm start
```

---

## ☁️ Free Cloud Deployment (Render)

SkyBook is pre-configured for **Render**'s free tier as a unified service (zero extra charges, zero database hosting fees).

### Method 1: Automatic Blueprint (Recommended)
1. Push your repository to **GitHub**.
2. Sign in to [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** &rarr; select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `skybook`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
6. Click **Apply**. Your app will be live with free SSL (e.g., `https://skybook.onrender.com`).

### Method 2: Manual Web Service Setup
If you prefer setting it up manually:
1. On Render, click **New +** &rarr; **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan Type**: `Free`
4. *(Optional)* Add Environment Variable: `NODE_ENV = production`.
5. Click **Deploy Web Service**.

### Keeping the Free Instance Awake 24/7
Free tier containers on Render spin down after 15 minutes of inactivity, causing a 30-second delay on the next visit. To keep your portfolio site instantly responsive at all times:
1. Create a free account at [UptimeRobot](https://uptimerobot.com).
2. Click **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **URL**: `https://<YOUR-RENDER-APP-NAME>.onrender.com/health`
   - **Monitoring Interval**: `10 minutes`
3. Click **Create Monitor**. 
UptimeRobot will send a ping every 10 minutes, keeping your server awake 24/7 so it loads instantly for recruiters and interviewers.

---

## 🗄️ Database Options & Extensibility

- **Current Architecture (In-Memory)**: The application currently uses an optimized in-memory store initialized with realistic airline seed data. This is ideal for portfolios because demo credentials and test flights work out of the box without monthly database maintenance.
- **Relational SQL Database (Optional)**: If you wish to connect a permanent cloud database, you can integrate with free managed services:
  - **Aiven for MySQL** (Free tier: 5 GB, 24/7 uptime without sleep)
  - **Neon / Supabase** (Free serverless PostgreSQL)
  - Connection can be established in `server.ts` by installing `mysql2` or `pg`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
