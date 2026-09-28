# SkyBook Frontend — Structure

This app was split from a single `main.jsx` into a standard component-based
layout. No behavior was changed — every component, handler, and comment was
moved as-is; only the file boundaries and imports changed.

```
src/
├── main.jsx                     # ReactDOM mount only
├── App.jsx                      # Session state, routing/tabs, top-level shell
├── styles.css
├── lib/
│   ├── api.js                   # fetch wrapper (unchanged)
│   ├── utils.js                 # validateRequired, rowsOf, normalizePayload,
│   │                             #   clean, pick, format, parseSeat, formatSeatClass
│   └── constants.js             # empty-form shapes, field configs, role tabs,
│                                 #   pricing constants, related-resource config
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Field.jsx
│   │   └── DataTable.jsx
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   └── navConfig.jsx        # iconFor / labelFor
│   ├── landing/
│   │   ├── LandingPage.jsx
│   │   ├── LandingFlightSearch.jsx
│   │   └── FlightMiniGame.jsx
│   ├── auth/
│   │   └── AuthScreen.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsersPanel.jsx
│   │   ├── AdminSeatsPanel.jsx
│   │   ├── AircraftFleetView.jsx
│   │   └── CrudPanel.jsx        # generic CRUD used for Flights/Aircraft/Schedules
│   ├── flights/
│   │   └── FlightSearch.jsx
│   ├── bookings/
│   │   ├── Bookings.jsx         # schedule → seat → passenger flow + admin view
│   │   ├── SeatMap.jsx
│   │   ├── SeatCell.jsx
│   │   ├── PriceBreakdown.jsx
│   │   └── PaymentFlow.jsx
│   ├── tickets/
│   │   ├── Tickets.jsx
│   │   └── TicketCard.jsx
│   ├── payments/
│   │   └── PaymentHistory.jsx
│   ├── profile/
│   │   └── Profile.jsx
│   └── shared/
│       └── SimpleCreateList.jsx # used for the Passengers tab
```

## Notes on the split

- **`lib/utils.js` vs `lib/constants.js`**: pure functions vs static data, so
  either can be imported without pulling in the other.
- **`SeatMap` / `SeatCell`** live under `bookings/` but are reused by
  `admin/AircraftFleetView.jsx` in a read-only mode — that's a normal
  cross-feature import, not a layering violation.
- **`CrudPanel`** is the one generic admin component reused for three
  resources (Flights, Aircraft, Schedules); resource-specific config
  (`relatedResourceConfig`, field lists) stays in `lib/constants.js` so the
  component itself has zero hardcoded resource knowledge.
- **`API_BASE_URL_EXPORT`** was added to `lib/api.js` so `Tickets.jsx` (which
  needs the raw base URL for a `fetch`-based PDF download, bypassing the
  JSON-parsing `api` wrapper) doesn't duplicate the
  `import.meta.env.VITE_API_BASE_URL` fallback logic.
- `bookingFields` remains exported from `constants.js` for parity with the
  original file, though nothing currently renders a Bookings `CrudPanel` —
  admin booking management goes through the dedicated `Bookings` component.

## Deploying to Render (100% Free Portfolio Hosting)

This application is ready to deploy on **Render** as a single, unified web service (Frontend + API):

### Option A: Automatic Deployment (Recommended)
1. Push this repository to GitHub.
2. Log into [Render](https://render.com) and click **New +** &rarr; **Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml` and configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Click **Apply**.

### Option B: Manual Web Service Setup
1. Log into [Render](https://render.com) and click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure the following:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Click **Deploy Web Service**.

### Pre-configured Demo Accounts
Once deployed, you can log in with:
- **Admin**: `admin@skybook.com` / `admin123`
- **User**: `user@skybook.com` / `user123`

### Keeping the Free Instance Awake (Optional)
Render's free tier spins down after 15 minutes of inactivity. To prevent cold starts:
1. Create a free account at [UptimeRobot](https://uptimerobot.com).
2. Add a new **HTTP(s)** monitor pointing to your Render app URL or health check (e.g. `https://your-app.onrender.com/health`).
3. Set the interval to **10 minutes**. This keeps your service awake 24/7!

