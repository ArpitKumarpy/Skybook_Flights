import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// --- In-Memory Database & Seed Data ---
let nextId = 1000;
const getId = () => ++nextId;

const nowIso = () => new Date().toISOString();
const todayIso = new Date().toISOString().split("T")[0];
const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const dayAfterIso = new Date(Date.now() + 172800000).toISOString().split("T")[0];

// Users
let users = [
  {
    id: 1,
    firstName: "Admin",
    lastName: "SkyBook",
    email: "admin@skybook.com",
    phoneNumber: "+1 800 555 0199",
    password: "admin123",
    role: "ADMIN" as const,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 2,
    firstName: "Alex",
    lastName: "Rivera",
    email: "user@skybook.com",
    phoneNumber: "+1 555 234 5678",
    password: "user123",
    role: "USER" as const,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Helper to build seat layout
const SEAT_LETTERS = ["A", "B", "C", "D", "E", "F"];
function buildSeatLayout(aircraftId: number, aircraftModel: string, totalSeats: number) {
  const seatsList: any[] = [];
  let row = 1;
  let generated = 0;

  const resolveClass = (r: number) => {
    if (r <= 2) return "FIRST";
    if (r <= 5) return "BUSINESS";
    if (r <= 10) return "PREMIUM_ECONOMY";
    return "ECONOMY";
  };

  const resolveType = (letter: string) => {
    if (letter === "A" || letter === "F") return "WINDOW";
    if (letter === "C" || letter === "D") return "AISLE";
    return "MIDDLE";
  };

  while (generated < totalSeats) {
    for (const letter of SEAT_LETTERS) {
      if (generated >= totalSeats) break;
      seatsList.push({
        id: getId(),
        seatNumber: `${row}${letter}`,
        seatClass: resolveClass(row),
        seatType: resolveType(letter),
        aircraftId,
        aircraftModel,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      generated++;
    }
    row++;
  }
  return seatsList;
}

// Aircrafts
let aircrafts = [
  { id: 101, modelNo: "Boeing 737-800", totalSeats: 60, createdAt: nowIso(), updatedAt: nowIso() },
  { id: 102, modelNo: "Airbus A320neo", totalSeats: 72, createdAt: nowIso(), updatedAt: nowIso() },
  { id: 103, modelNo: "Boeing 787 Dreamliner", totalSeats: 90, createdAt: nowIso(), updatedAt: nowIso() },
];

// Seats generated for each aircraft
let seats: any[] = [
  ...buildSeatLayout(101, "Boeing 737-800", 60),
  ...buildSeatLayout(102, "Airbus A320neo", 72),
  ...buildSeatLayout(103, "Boeing 787 Dreamliner", 90),
];

// Flights
let flights = [
  {
    id: 201,
    flightNumber: "SB-101",
    airlineName: "SkyBook Express",
    source: "New York",
    destination: "London",
    price: 650,
    status: "SCHEDULED",
    aircraftId: 103,
    aircraftModel: "Boeing 787 Dreamliner",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 202,
    flightNumber: "SB-204",
    airlineName: "SkyBook Express",
    source: "San Francisco",
    destination: "Tokyo",
    price: 820,
    status: "SCHEDULED",
    aircraftId: 102,
    aircraftModel: "Airbus A320neo",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 203,
    flightNumber: "SB-305",
    airlineName: "SkyBook Regional",
    source: "London",
    destination: "Paris",
    price: 140,
    status: "SCHEDULED",
    aircraftId: 101,
    aircraftModel: "Boeing 737-800",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 204,
    flightNumber: "SB-412",
    airlineName: "SkyBook Express",
    source: "Dubai",
    destination: "Singapore",
    price: 540,
    status: "SCHEDULED",
    aircraftId: 103,
    aircraftModel: "Boeing 787 Dreamliner",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 205,
    flightNumber: "SB-550",
    airlineName: "SkyBook Regional",
    source: "New York",
    destination: "Miami",
    price: 195,
    status: "SCHEDULED",
    aircraftId: 101,
    aircraftModel: "Boeing 737-800",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Schedules
let schedules = [
  {
    id: 301,
    departureDate: todayIso,
    departureTime: "08:30:00",
    arrivalDate: todayIso,
    arrivalTime: "20:45:00",
    availableSeats: 88,
    flightId: 201,
    flightNumber: "SB-101",
    airlineName: "SkyBook Express",
    source: "New York",
    destination: "London",
    price: 650,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 302,
    departureDate: tomorrowIso,
    departureTime: "10:15:00",
    arrivalDate: tomorrowIso,
    arrivalTime: "22:30:00",
    availableSeats: 90,
    flightId: 201,
    flightNumber: "SB-101",
    airlineName: "SkyBook Express",
    source: "New York",
    destination: "London",
    price: 650,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 303,
    departureDate: todayIso,
    departureTime: "11:00:00",
    arrivalDate: tomorrowIso,
    arrivalTime: "15:20:00",
    availableSeats: 70,
    flightId: 202,
    flightNumber: "SB-204",
    airlineName: "SkyBook Express",
    source: "San Francisco",
    destination: "Tokyo",
    price: 820,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 304,
    departureDate: todayIso,
    departureTime: "14:20:00",
    arrivalDate: todayIso,
    arrivalTime: "16:40:00",
    availableSeats: 58,
    flightId: 203,
    flightNumber: "SB-305",
    airlineName: "SkyBook Regional",
    source: "London",
    destination: "Paris",
    price: 140,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 305,
    departureDate: tomorrowIso,
    departureTime: "09:00:00",
    arrivalDate: tomorrowIso,
    arrivalTime: "21:15:00",
    availableSeats: 90,
    flightId: 204,
    flightNumber: "SB-412",
    airlineName: "SkyBook Express",
    source: "Dubai",
    destination: "Singapore",
    price: 540,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 306,
    departureDate: todayIso,
    departureTime: "17:45:00",
    arrivalDate: todayIso,
    arrivalTime: "21:00:00",
    availableSeats: 60,
    flightId: 205,
    flightNumber: "SB-550",
    airlineName: "SkyBook Regional",
    source: "New York",
    destination: "Miami",
    price: 195,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Bookings
let bookings: any[] = [
  {
    id: 401,
    bookingReference: "SB-INIT01",
    groupBookingReference: "SB-GRP01",
    bookingStatus: "CONFIRMED",
    baseFare: 650,
    seatSurcharge: 350,
    gstAmount: 180,
    totalAmount: 1180,
    bookedAt: nowIso(),
    reservationExpiresAt: null,
    userId: 2,
    scheduleId: 301,
    seatId: seats.find((s) => s.aircraftId === 103 && s.seatNumber === "1A")?.id || 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Passengers
let passengers: any[] = [
  {
    id: 501,
    passengerId: 501,
    firstName: "Alex",
    lastName: "Rivera",
    gender: "MALE",
    dateOfBirth: "1992-06-15",
    passportNumber: "P98765432",
    nationality: "United States",
    bookingId: 401,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Payments
let payments: any[] = [
  {
    id: 601,
    paymentReference: "PAY-INIT01",
    paymentMethod: "UPI",
    paymentStatus: "SUCCESS",
    amount: 1180,
    paymentDate: nowIso(),
    bookingId: 401,
    userId: 2,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Tickets
let tickets: any[] = [
  {
    id: 701,
    ticketNumber: "SB-TK-INIT01",
    bookingId: 401,
    ticketStatus: "CONFIRMED",
    issueDate: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// Travel History
let travelHistory: any[] = [
  {
    id: 801,
    userId: 2,
    bookingId: 401,
    bookingReference: "SB-INIT01",
    flightNumber: "SB-101",
    airlineName: "SkyBook Express",
    source: "New York",
    destination: "London",
    departureDate: todayIso,
    departureTime: "08:30:00",
    arrivalTime: "20:45:00",
    travelStatus: "UPCOMING",
    createdAt: nowIso(),
  },
];

// --- Auth Helper & Middleware ---
function resolveUser(req: Request) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  // Token format: token-<userId>-<random>
  const match = token.match(/token-(\d+)/);
  if (match) {
    const uid = Number(match[1]);
    return users.find((u) => u.id === uid) || null;
  }
  // Default fallback if token exists
  return users.find((u) => u.role === "USER") || users[0];
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = resolveUser(req);
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  (req as any).user = user;
  next();
}

function makeToken(user: any) {
  return `token-${user.id}-${Date.now()}`;
}

// --- Pricing Calculation Helper ---
const SURCHARGES: Record<string, number> = { WINDOW: 350, AISLE: 200, MIDDLE: 0 };
function calculateFare(basePrice: number, seatClass: string, seatType: string) {
  let multiplier = 1.0;
  if (seatClass === "PREMIUM_ECONOMY") multiplier = 1.25;
  else if (seatClass === "BUSINESS") multiplier = 1.75;
  else if (seatClass === "FIRST") multiplier = 2.5;

  const classFare = Math.round(basePrice * multiplier);
  const seatSurcharge = SURCHARGES[seatType] ?? 0;
  const preTax = classFare + seatSurcharge;
  const gst = Math.round(preTax * 0.18);
  const total = preTax + gst;
  return { classFare, seatSurcharge, gst, total };
}

// ==========================================
// API ROUTES
// ==========================================

// --- Auth Routes ---
app.post("/api/auth/register", (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "Email already registered" });
  }
  const newUser = {
    id: getId(),
    firstName: firstName || "",
    lastName: lastName || "",
    email,
    phoneNumber: phoneNumber || "",
    password,
    role: "USER" as const,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  users.push(newUser);
  res.status(201).json({
    token: makeToken(newUser),
    tokenType: "Bearer",
    userId: newUser.id,
    email: newUser.email,
    role: "ROLE_USER",
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({
    token: makeToken(user),
    tokenType: "Bearer",
    userId: user.id,
    email: user.email,
    role: `ROLE_${user.role}`,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

// --- Aircrafts ---
app.get("/api/aircrafts", (_req, res) => {
  res.json(aircrafts);
});

app.get("/api/aircrafts/:id", (req, res) => {
  const item = aircrafts.find((a) => a.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Aircraft not found" });
  res.json(item);
});

app.post("/api/aircrafts", requireAdmin, (req, res) => {
  const { modelNo, totalSeats } = req.body;
  const count = Number(totalSeats) || 60;
  const newAircraft = {
    id: getId(),
    modelNo: modelNo || "Aircraft Model",
    totalSeats: count,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  aircrafts.push(newAircraft);
  const newSeats = buildSeatLayout(newAircraft.id, newAircraft.modelNo, count);
  seats.push(...newSeats);
  res.status(201).json(newAircraft);
});

app.put("/api/aircrafts/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = aircrafts.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ message: "Aircraft not found" });

  const { modelNo, totalSeats } = req.body;
  const newSeatsCount = Number(totalSeats) || aircrafts[index].totalSeats;
  const seatCountChanged = newSeatsCount !== aircrafts[index].totalSeats;

  aircrafts[index] = {
    ...aircrafts[index],
    modelNo: modelNo || aircrafts[index].modelNo,
    totalSeats: newSeatsCount,
    updatedAt: nowIso(),
  };

  if (seatCountChanged) {
    seats = seats.filter((s) => s.aircraftId !== id);
    seats.push(...buildSeatLayout(id, aircrafts[index].modelNo, newSeatsCount));
  }
  res.json(aircrafts[index]);
});

app.delete("/api/aircrafts/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  aircrafts = aircrafts.filter((a) => a.id !== id);
  seats = seats.filter((s) => s.aircraftId !== id);
  res.status(204).end();
});

// --- Seats ---
app.get("/api/seats", requireAdmin, (_req, res) => {
  res.json(seats);
});

app.get("/api/seats/aircraft/:aircraftId", requireAdmin, (req, res) => {
  const aid = Number(req.params.aircraftId);
  const aircraftSeats = seats.filter((s) => s.aircraftId === aid);
  res.json(aircraftSeats);
});

app.get("/api/seats/availability/:scheduleId", (req, res) => {
  const scheduleId = Number(req.params.scheduleId);
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });

  const flight = flights.find((f) => f.id === schedule.flightId);
  const aircraftId = flight?.aircraftId;
  const aircraftSeats = seats.filter((s) => s.aircraftId === aircraftId);

  // Check booked seats for this schedule
  const activeBookings = bookings.filter((b) => b.scheduleId === scheduleId && b.bookingStatus !== "CANCELLED");
  const bookedSeatIds = new Set(activeBookings.map((b) => b.seatId));

  const availability = aircraftSeats.map((seat) => ({
    seatId: seat.id,
    seatNumber: seat.seatNumber,
    seatClass: seat.seatClass,
    seatType: seat.seatType,
    status: bookedSeatIds.has(seat.id) ? "BOOKED" : "AVAILABLE",
  }));

  res.json(availability);
});

app.post("/api/seats", requireAdmin, (req, res) => {
  const { seatNumber, seatClass, seatType, aircraftId } = req.body;
  const aircraft = aircrafts.find((a) => a.id === Number(aircraftId));
  const newSeat = {
    id: getId(),
    seatNumber,
    seatClass: seatClass || "ECONOMY",
    seatType: seatType || "WINDOW",
    aircraftId: Number(aircraftId),
    aircraftModel: aircraft?.modelNo || "Aircraft",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  seats.push(newSeat);
  res.status(201).json(newSeat);
});

app.put("/api/seats/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const idx = seats.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: "Seat not found" });

  seats[idx] = {
    ...seats[idx],
    ...req.body,
    id,
    updatedAt: nowIso(),
  };
  res.json(seats[idx]);
});

app.delete("/api/seats/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  seats = seats.filter((s) => s.id !== id);
  res.status(204).end();
});

// --- Flights ---
app.get("/api/flights", (_req, res) => {
  res.json({ content: flights, totalElements: flights.length });
});

app.get("/api/flights/:id", (req, res) => {
  const flight = flights.find((f) => f.id === Number(req.params.id));
  if (!flight) return res.status(404).json({ message: "Flight not found" });
  res.json(flight);
});

app.get("/api/flights/search", (req, res) => {
  const { source, destination, departureDate, airline, minPrice, maxPrice, status } = req.query as Record<string, string>;

  // Find matching schedules
  const results = schedules
    .filter((s) => {
      const matchSource = !source || s.source.toLowerCase().includes(source.toLowerCase());
      const matchDest = !destination || s.destination.toLowerCase().includes(destination.toLowerCase());
      const matchDate = !departureDate || s.departureDate === departureDate;
      const matchAirline = !airline || s.airlineName.toLowerCase().includes(airline.toLowerCase());
      const matchMinPrice = !minPrice || s.price >= Number(minPrice);
      const matchMaxPrice = !maxPrice || s.price <= Number(maxPrice);
      return matchSource && matchDest && matchDate && matchAirline && matchMinPrice && matchMaxPrice;
    })
    .map((s) => {
      const flight = flights.find((f) => f.id === s.flightId);
      return {
        id: s.flightId,
        flightId: s.flightId,
        scheduleId: s.id,
        flightNumber: s.flightNumber,
        airlineName: s.airlineName,
        source: s.source,
        destination: s.destination,
        departureDate: s.departureDate,
        departureTime: s.departureTime,
        arrivalTime: s.arrivalTime,
        price: s.price,
        availableSeats: s.availableSeats,
        status: flight?.status || "SCHEDULED",
      };
    });

  res.json(results);
});

app.post("/api/flights", requireAdmin, (req, res) => {
  const { flightNumber, airlineName, source, destination, price, status, aircraftId } = req.body;
  const aircraft = aircrafts.find((a) => a.id === Number(aircraftId));
  const newFlight = {
    id: getId(),
    flightNumber,
    airlineName,
    source,
    destination,
    price: Number(price) || 200,
    status: status || "SCHEDULED",
    aircraftId: Number(aircraftId) || (aircrafts[0]?.id ?? 101),
    aircraftModel: aircraft?.modelNo || "Standard Aircraft",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  flights.push(newFlight);
  res.status(201).json(newFlight);
});

app.put("/api/flights/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const idx = flights.findIndex((f) => f.id === id);
  if (idx === -1) return res.status(404).json({ message: "Flight not found" });

  const aircraft = req.body.aircraftId ? aircrafts.find((a) => a.id === Number(req.body.aircraftId)) : null;

  flights[idx] = {
    ...flights[idx],
    ...req.body,
    aircraftModel: aircraft ? aircraft.modelNo : flights[idx].aircraftModel,
    id,
    updatedAt: nowIso(),
  };
  res.json(flights[idx]);
});

app.delete("/api/flights/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  flights = flights.filter((f) => f.id !== id);
  schedules = schedules.filter((s) => s.flightId !== id);
  res.status(204).end();
});

// --- Schedules ---
app.get("/api/schedules", (_req, res) => {
  res.json(schedules);
});

app.get("/api/schedules/:id", (req, res) => {
  const schedule = schedules.find((s) => s.id === Number(req.params.id));
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json(schedule);
});

app.get("/api/schedules/flight/:flightId", (req, res) => {
  const fid = Number(req.params.flightId);
  res.json(schedules.filter((s) => s.flightId === fid));
});

app.get("/api/schedules/date", (req, res) => {
  const date = String(req.query.departureDate);
  res.json(schedules.filter((s) => s.departureDate === date));
});

app.post("/api/schedules", requireAdmin, (req, res) => {
  const { departureDate, departureTime, arrivalTime, flightId } = req.body;
  const flight = flights.find((f) => f.id === Number(flightId));
  const aircraft = flight ? aircrafts.find((a) => a.id === flight.aircraftId) : null;
  const totalSeats = aircraft?.totalSeats || 60;

  const newSchedule = {
    id: getId(),
    departureDate,
    departureTime,
    arrivalDate: departureDate,
    arrivalTime,
    availableSeats: totalSeats,
    flightId: Number(flightId),
    flightNumber: flight?.flightNumber || "",
    airlineName: flight?.airlineName || "",
    source: flight?.source || "",
    destination: flight?.destination || "",
    price: flight?.price || 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
});

app.put("/api/schedules/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const idx = schedules.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: "Schedule not found" });

  const flight = req.body.flightId ? flights.find((f) => f.id === Number(req.body.flightId)) : null;

  schedules[idx] = {
    ...schedules[idx],
    ...req.body,
    flightNumber: flight ? flight.flightNumber : schedules[idx].flightNumber,
    airlineName: flight ? flight.airlineName : schedules[idx].airlineName,
    source: flight ? flight.source : schedules[idx].source,
    destination: flight ? flight.destination : schedules[idx].destination,
    price: flight ? flight.price : schedules[idx].price,
    id,
    updatedAt: nowIso(),
  };
  res.json(schedules[idx]);
});

app.delete("/api/schedules/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  schedules = schedules.filter((s) => s.id !== id);
  res.status(204).end();
});

// --- Bookings ---
app.get("/api/bookings", requireAuth, (req, res) => {
  const user = (req as any).user;
  if (user.role === "ADMIN") {
    return res.json(bookings);
  }
  const userBookings = bookings.filter((b) => b.userId === user.id);
  res.json(userBookings);
});

app.get("/api/bookings/:id", requireAuth, (req, res) => {
  const user = (req as any).user;
  const booking = bookings.find((b) => b.id === Number(req.params.id));
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (user.role !== "ADMIN" && booking.userId !== user.id) {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json(booking);
});

app.post("/api/bookings/batch", requireAuth, (req, res) => {
  const user = (req as any).user;
  const { scheduleId, seats: requestedSeats } = req.body;

  const schedule = schedules.find((s) => s.id === Number(scheduleId));
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });

  const flight = flights.find((f) => f.id === schedule.flightId);
  const basePrice = flight?.price || schedule.price || 200;

  const groupBookingReference = `SB-GRP${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const createdBookings: any[] = [];

  for (const item of requestedSeats) {
    const seatRecord = seats.find((s) => s.id === Number(item.seatId));
    const seatClass = seatRecord?.seatClass || "ECONOMY";
    const seatType = seatRecord?.seatType || "WINDOW";
    const fare = calculateFare(basePrice, seatClass, seatType);

    const bookingRef = `SB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newBooking = {
      id: getId(),
      bookingReference: bookingRef,
      groupBookingReference,
      bookingStatus: "PENDING",
      baseFare: fare.classFare,
      seatSurcharge: fare.seatSurcharge,
      gstAmount: fare.gst,
      totalAmount: fare.total,
      bookedAt: nowIso(),
      reservationExpiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
      userId: user.id,
      scheduleId: schedule.id,
      seatId: Number(item.seatId),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    bookings.push(newBooking);
    createdBookings.push(newBooking);

    // Save passenger record
    if (item.passenger) {
      const p = item.passenger;
      const pid = getId();
      passengers.push({
        id: pid,
        passengerId: pid,
        firstName: p.firstName || user.firstName,
        lastName: p.lastName || user.lastName,
        gender: p.gender || "MALE",
        dateOfBirth: p.dateOfBirth || "1995-01-01",
        passportNumber: p.passportNumber || "P12345678",
        nationality: p.nationality || "Standard",
        bookingId: newBooking.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
  }

  // Decrement available seats
  schedule.availableSeats = Math.max(0, schedule.availableSeats - requestedSeats.length);

  res.status(201).json(createdBookings);
});

app.post("/api/bookings", requireAuth, (req, res) => {
  const user = (req as any).user;
  const { scheduleId, seatId, passenger } = req.body;
  const schedule = schedules.find((s) => s.id === Number(scheduleId));
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });

  const flight = flights.find((f) => f.id === schedule.flightId);
  const basePrice = flight?.price || schedule.price || 200;

  const seatRecord = seats.find((s) => s.id === Number(seatId));
  const seatClass = seatRecord?.seatClass || "ECONOMY";
  const seatType = seatRecord?.seatType || "WINDOW";
  const fare = calculateFare(basePrice, seatClass, seatType);

  const bookingRef = `SB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newBooking = {
    id: getId(),
    bookingReference: bookingRef,
    groupBookingReference: bookingRef,
    bookingStatus: "PENDING",
    baseFare: fare.classFare,
    seatSurcharge: fare.seatSurcharge,
    gstAmount: fare.gst,
    totalAmount: fare.total,
    bookedAt: nowIso(),
    reservationExpiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    userId: user.id,
    scheduleId: schedule.id,
    seatId: Number(seatId),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  bookings.push(newBooking);

  if (passenger) {
    const pid = getId();
    passengers.push({
      id: pid,
      passengerId: pid,
      firstName: passenger.firstName || user.firstName,
      lastName: passenger.lastName || user.lastName,
      gender: passenger.gender || "MALE",
      dateOfBirth: passenger.dateOfBirth || "1995-01-01",
      passportNumber: passenger.passportNumber || "P12345678",
      nationality: passenger.nationality || "Standard",
      bookingId: newBooking.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  schedule.availableSeats = Math.max(0, schedule.availableSeats - 1);
  res.status(201).json(newBooking);
});

app.patch("/api/bookings/:id/cancel", requireAuth, (req, res) => {
  const user = (req as any).user;
  const booking = bookings.find((b) => b.id === Number(req.params.id));
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (user.role !== "ADMIN" && booking.userId !== user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (booking.bookingStatus !== "CANCELLED") {
    booking.bookingStatus = "CANCELLED";
    booking.updatedAt = nowIso();
    const schedule = schedules.find((s) => s.id === booking.scheduleId);
    if (schedule) schedule.availableSeats += 1;

    // Update tickets & travel history
    const t = tickets.find((tk) => tk.bookingId === booking.id);
    if (t) t.ticketStatus = "CANCELLED";

    const th = travelHistory.find((h) => h.bookingId === booking.id);
    if (th) th.travelStatus = "CANCELLED";
  }

  res.json(booking);
});

// --- Payments ---
function confirmBookingAndIssueTicket(booking: any) {
  booking.bookingStatus = "CONFIRMED";
  booking.reservationExpiresAt = null;
  booking.updatedAt = nowIso();

  // Create Ticket
  const ticketNum = `SB-TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newTicket = {
    id: getId(),
    ticketNumber: ticketNum,
    bookingId: booking.id,
    ticketStatus: "CONFIRMED",
    issueDate: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  tickets.push(newTicket);

  // Create Travel History
  const schedule = schedules.find((s) => s.id === booking.scheduleId);
  travelHistory.push({
    id: getId(),
    userId: booking.userId,
    bookingId: booking.id,
    bookingReference: booking.bookingReference,
    flightNumber: schedule?.flightNumber || "SB-100",
    airlineName: schedule?.airlineName || "SkyBook Airlines",
    source: schedule?.source || "Origin",
    destination: schedule?.destination || "Destination",
    departureDate: schedule?.departureDate || todayIso,
    departureTime: schedule?.departureTime || "12:00:00",
    arrivalTime: schedule?.arrivalTime || "14:30:00",
    travelStatus: "UPCOMING",
    createdAt: nowIso(),
  });

  return newTicket;
}

app.post("/api/payments", requireAuth, (req, res) => {
  const user = (req as any).user;
  const { bookingId, paymentMethod } = req.body;
  const booking = bookings.find((b) => b.id === Number(bookingId));
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  confirmBookingAndIssueTicket(booking);

  const payment = {
    id: getId(),
    paymentReference: `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    paymentMethod: paymentMethod || "UPI",
    paymentStatus: "SUCCESS",
    amount: booking.totalAmount,
    paymentDate: nowIso(),
    bookingId: booking.id,
    userId: user.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  payments.push(payment);

  res.status(201).json(payment);
});

app.post("/api/payments/batch", requireAuth, (req, res) => {
  const user = (req as any).user;
  const { bookingIds, paymentMethod } = req.body;
  const createdPayments: any[] = [];

  for (const bid of bookingIds) {
    const booking = bookings.find((b) => b.id === Number(bid));
    if (booking) {
      confirmBookingAndIssueTicket(booking);
      const payment = {
        id: getId(),
        paymentReference: `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        paymentMethod: paymentMethod || "UPI",
        paymentStatus: "SUCCESS",
        amount: booking.totalAmount,
        paymentDate: nowIso(),
        bookingId: booking.id,
        userId: user.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      payments.push(payment);
      createdPayments.push(payment);
    }
  }

  res.status(201).json(createdPayments);
});

app.get("/api/payments/history", requireAuth, (req, res) => {
  const user = (req as any).user;
  const userPayments = user.role === "ADMIN" ? payments : payments.filter((p) => p.userId === user.id);
  res.json(userPayments);
});

// --- Tickets ---
app.get("/api/tickets", requireAuth, (req, res) => {
  const user = (req as any).user;
  if (user.role === "ADMIN") {
    return res.json(tickets);
  }
  const userBookingIds = new Set(bookings.filter((b) => b.userId === user.id).map((b) => b.id));
  const userTickets = tickets.filter((t) => userBookingIds.has(t.bookingId));
  res.json(userTickets);
});

app.get("/api/tickets/:id", requireAuth, (req, res) => {
  const ticket = tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  res.json(ticket);
});

app.delete("/api/tickets/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  tickets = tickets.filter((t) => t.id !== id);
  res.status(204).end();
});

// PDF Generation for ticket download
function generateTicketPdfBuffer(ticket: any, booking: any, schedule: any, passenger: any, seat: any): Buffer {
  const lines = [
    "==========================================================",
    "               SKYBOOK OFFICIAL E-TICKET                  ",
    "==========================================================",
    "",
    `Ticket Number:      ${ticket.ticketNumber}`,
    `Booking Reference:  ${booking?.bookingReference || "N/A"}`,
    `Group Reference:    ${booking?.groupBookingReference || "N/A"}`,
    `Ticket Status:      ${ticket.ticketStatus}`,
    `Issue Date:         ${ticket.issueDate ? new Date(ticket.issueDate).toLocaleString() : new Date().toLocaleString()}`,
    "",
    "------------------- PASSENGER DETAILS --------------------",
    `Name:               ${passenger ? `${passenger.firstName} ${passenger.lastName}` : "Valued Passenger"}`,
    `Passport:           ${passenger?.passportNumber || "N/A"}`,
    `Nationality:        ${passenger?.nationality || "N/A"}`,
    `Gender:             ${passenger?.gender || "N/A"}`,
    "",
    "------------------- FLIGHT & SCHEDULE --------------------",
    `Flight Number:      ${schedule?.flightNumber || "SB-100"}`,
    `Airline:            ${schedule?.airlineName || "SkyBook Airways"}`,
    `Route:              ${schedule?.source || "Origin"} -> ${schedule?.destination || "Destination"}`,
    `Departure Date:     ${schedule?.departureDate || todayIso}`,
    `Departure Time:     ${schedule?.departureTime || "10:00:00"}`,
    `Arrival Time:       ${schedule?.arrivalTime || "12:30:00"}`,
    `Seat Assigned:      ${seat?.seatNumber || "N/A"} (${seat?.seatClass || "ECONOMY"}, ${seat?.seatType || "SEAT"})`,
    "",
    "------------------- FARE & PAYMENT -----------------------",
    `Base Class Fare:    INR ${booking?.baseFare || 0}`,
    `Seat Surcharge:     INR ${booking?.seatSurcharge || 0}`,
    `GST (18%):          INR ${booking?.gstAmount || 0}`,
    `Total Amount Paid:  INR ${booking?.totalAmount || 0}`,
    "",
    "==========================================================",
    "       Thank you for choosing SkyBook. Have a safe trip!   ",
    "==========================================================",
  ];

  let textStream = "BT\n/F1 11 Tf\n40 760 Td\n18 TL\n";
  for (const line of lines) {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    textStream += `(${escaped}) '\n`;
  }
  textStream += "ET";

  const streamLen = Buffer.byteLength(textStream, "utf8");

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${textStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLen}
%%EOF`;

  return Buffer.from(pdf, "binary");
}

app.get("/api/tickets/:id/download", requireAuth, (req, res) => {
  const user = (req as any).user;
  const ticket = tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const booking = bookings.find((b) => b.id === ticket.bookingId);
  if (user.role !== "ADMIN" && booking?.userId !== user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  const schedule = booking ? schedules.find((s) => s.id === booking.scheduleId) : null;
  const passenger = booking ? passengers.find((p) => p.bookingId === booking.id) : null;
  const seat = booking ? seats.find((s) => s.id === booking.seatId) : null;

  const pdfBuffer = generateTicketPdfBuffer(ticket, booking, schedule, passenger, seat);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=ticket-${ticket.ticketNumber || ticket.id}.pdf`);
  res.send(pdfBuffer);
});

// --- Passengers ---
app.get("/api/passengers", requireAuth, (_req, res) => {
  res.json(passengers);
});

app.get("/api/passengers/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const p = passengers.find((item) => item.id === id || item.passengerId === id);
  if (!p) return res.status(404).json({ message: "Passenger not found" });
  res.json(p);
});

app.get("/api/passengers/booking/:bookingId", requireAuth, (req, res) => {
  const bid = Number(req.params.bookingId);
  res.json(passengers.filter((p) => p.bookingId === bid));
});

app.post("/api/passengers", requireAuth, (req, res) => {
  const pid = getId();
  const newPassenger = {
    id: pid,
    passengerId: pid,
    ...req.body,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  passengers.push(newPassenger);
  res.status(201).json(newPassenger);
});

app.put("/api/passengers/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = passengers.findIndex((p) => p.id === id || p.passengerId === id);
  if (idx === -1) return res.status(404).json({ message: "Passenger not found" });

  passengers[idx] = {
    ...passengers[idx],
    ...req.body,
    id,
    passengerId: id,
    updatedAt: nowIso(),
  };
  res.json(passengers[idx]);
});

app.delete("/api/passengers/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  passengers = passengers.filter((p) => p.id !== id && p.passengerId !== id);
  res.status(204).end();
});

// --- Users ---
app.get("/api/users", requireAdmin, (_req, res) => {
  res.json(users);
});

app.get("/api/users/:id", requireAuth, (req, res) => {
  const user = (req as any).user;
  const targetId = Number(req.params.id);
  if (user.role !== "ADMIN" && user.id !== targetId) {
    return res.status(403).json({ message: "Access denied" });
  }
  const target = users.find((u) => u.id === targetId);
  if (!target) return res.status(404).json({ message: "User not found" });
  res.json(target);
});

app.put("/api/users/:id", requireAuth, (req, res) => {
  const user = (req as any).user;
  const targetId = Number(req.params.id);
  if (user.role !== "ADMIN" && user.id !== targetId) {
    return res.status(403).json({ message: "Access denied" });
  }
  const idx = users.findIndex((u) => u.id === targetId);
  if (idx === -1) return res.status(404).json({ message: "User not found" });

  users[idx] = {
    ...users[idx],
    firstName: req.body.firstName ?? users[idx].firstName,
    lastName: req.body.lastName ?? users[idx].lastName,
    email: req.body.email ?? users[idx].email,
    phoneNumber: req.body.phoneNumber ?? users[idx].phoneNumber,
    updatedAt: nowIso(),
  };
  res.json(users[idx]);
});

app.patch("/api/users/:id/role", requireAdmin, (req, res) => {
  const targetId = Number(req.params.id);
  const target = users.find((u) => u.id === targetId);
  if (!target) return res.status(404).json({ message: "User not found" });

  target.role = req.body.role === "ADMIN" ? "ADMIN" : "USER";
  target.updatedAt = nowIso();
  res.json(target);
});

app.delete("/api/users/:id", requireAdmin, (req, res) => {
  const targetId = Number(req.params.id);
  users = users.filter((u) => u.id !== targetId);
  res.status(204).end();
});

// --- Travel History ---
app.get("/api/travel-history/user/:userId", requireAuth, (req, res) => {
  const uid = Number(req.params.userId);
  const userHistory = travelHistory.filter((t) => t.userId === uid);
  res.json(userHistory);
});

app.get("/api/travel-history/statistics/:userId", requireAuth, (req, res) => {
  const uid = Number(req.params.userId);
  const userHistory = travelHistory.filter((t) => t.userId === uid);
  const destinations = userHistory.map((t) => t.destination);
  const citiesVisited = [...new Set(destinations)];

  // Determine favourite destination
  const destCounts: Record<string, number> = {};
  destinations.forEach((d) => (destCounts[d] = (destCounts[d] || 0) + 1));
  let favouriteDestination = destinations[0] || "-";
  let maxCount = 0;
  for (const [dest, count] of Object.entries(destCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favouriteDestination = dest;
    }
  }

  res.json({
    totalFlights: userHistory.length,
    favouriteDestination,
    lastDestination: destinations[destinations.length - 1] || "-",
    citiesVisited,
  });
});

app.get("/api/travel-history/cities/:userId", requireAuth, (req, res) => {
  const uid = Number(req.params.userId);
  const userHistory = travelHistory.filter((t) => t.userId === uid);
  const cities = [...new Set(userHistory.map((t) => t.destination))];
  res.json(cities);
});

app.get("/api/travel-history/last-location/:userId", requireAuth, (req, res) => {
  const uid = Number(req.params.userId);
  const userHistory = travelHistory.filter((t) => t.userId === uid);
  const last = userHistory[userHistory.length - 1]?.destination || "None";
  res.json(last);
});

// ==========================================
// Vite Middleware / Static Serve
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkyBook server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
