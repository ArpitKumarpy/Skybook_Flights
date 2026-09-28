export const emptyFlight = {
  flightNumber: "",
  airlineName: "",
  source: "",
  destination: "",
  price: "",
  status: "SCHEDULED",
  aircraftId: "",
};

export const emptyAircraft = { modelNo: "", totalSeats: "" };
export const emptySchedule = { departureDate: "", departureTime: "", arrivalTime: "", flightId: "" };
export const emptySeat = { seatNumber: "", seatClass: "ECONOMY", seatType: "WINDOW", aircraftId: "" };
export const emptyPassenger = { firstName: "", lastName: "", gender: "MALE", dateOfBirth: "", passportNumber: "", nationality: "", bookingId: "" };
export const emptyPassengerForm = { firstName: "", lastName: "", gender: "MALE", dateOfBirth: "", passportNumber: "", nationality: "" };

// Mirrors the backend defaults (BookingServiceImpl's windowSurcharge /
// aisleSurcharge, configurable via application.properties as
// skybook.pricing.seat-surcharge.window / .aisle). This is only used to
// render the pre-reservation estimate below — the authoritative amount is
// whatever the server returns in the booking response's baseFare /
// seatSurcharge / gstAmount / totalAmount fields once a seat is actually
// reserved. If you change the surcharge in application.properties, update
// this constant to match so the estimate doesn't drift from reality.
export const SEAT_TYPE_SURCHARGE = { WINDOW: 350, AISLE: 200, MIDDLE: 0 };

export const roleTabs = {
  USER: [
    "search",
    "bookings",
    "passengers",
    "history",
    "travel-history",
    "tickets",
    "profile"
  ],

  ADMIN: [
    "dashboard",
    "search",
    "flights",
    "aircraft",
    "fleet",
    "schedules",
    "seats",
    "users",
    "bookings",
    "tickets"
  ],
};

export const flightFields = [
  { name: "flightNumber", label: "Flight number" },
  { name: "airlineName", label: "Airline name" },
  { name: "source", label: "Source" },
  { name: "destination", label: "Destination" },
  { name: "price", label: "Price", type: "number" },
  { name: "status", label: "Status", options: ["SCHEDULED", "DELAYED", "CANCELLED", "DEPARTED"] },
  { name: "aircraftId", label: "Aircraft" },
];

export const aircraftFields = [
  { name: "modelNo", label: "Model number" },
  { name: "totalSeats", label: "Total seats", type: "number" },
];

export const scheduleFields = [
  { name: "departureDate", label: "Departure date", type: "date" },
  { name: "departureTime", label: "Departure time", type: "time" },
  { name: "arrivalTime", label: "Arrival time", type: "time" },
  { name: "flightId", label: "Flight" },
];

export const seatFields = [
  { name: "seatNumber", label: "Seat number" },
  { name: "seatClass", label: "Seat class", options: ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] },
  { name: "seatType", label: "Seat type", options: ["WINDOW", "AISLE", "MIDDLE"] },
  { name: "aircraftId", label: "Aircraft ID", type: "number" },
];

export const bookingFields = [
  { name: "userId", label: "User ID", type: "number" },
  { name: "scheduleId", label: "Schedule ID", type: "number" },
  { name: "seatId", label: "Seat ID", type: "number" },
];

export const passengerFields = [
  { name: "firstName", label: "First name" },
  { name: "lastName", label: "Last name" },
  { name: "gender", label: "Gender", options: ["MALE", "FEMALE", "OTHER"] },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  { name: "passportNumber", label: "Passport number" },
  { name: "nationality", label: "Nationality" },
  { name: "bookingId", label: "Booking ID", type: "number" },
];

// Resources whose forms need a dropdown backed by another resource
// (Flights -> Aircraft, Schedules -> Flights).
export const relatedResourceConfig = {
  flights: { field: "aircraftId", resource: "aircrafts", label: (a) => `${a.modelNo} (${a.totalSeats} seats)` },
  schedules: { field: "flightId", resource: "flights", label: (f) => `${f.flightNumber} · ${f.source} → ${f.destination}` },
};

// createdAt/updatedAt exist on every entity for auditing but aren't useful
// to show in any admin/user table — hiding them here (rather than per-usage)
// means every DataTable in the app is fixed by this one change.
export const HIDDEN_COLUMNS = new Set(["createdAt", "updatedAt"]);
