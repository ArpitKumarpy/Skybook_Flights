import { useEffect, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { LandingPage } from "./components/landing/LandingPage";
import { AuthScreen } from "./components/auth/AuthScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminUsersPanel } from "./components/admin/AdminUsersPanel";
import { AdminSeatsPanel } from "./components/admin/AdminSeatsPanel";
import { AircraftFleetView } from "./components/admin/AircraftFleetView";
import { CrudPanel } from "./components/admin/CrudPanel";
import { FlightSearch } from "./components/flights/FlightSearch";
import { Bookings } from "./components/bookings/Bookings";
import { PaymentFlow } from "./components/bookings/PaymentFlow";
import { Tickets } from "./components/tickets/Tickets";
import { PaymentHistory } from "./components/payments/PaymentHistory";
import { Profile } from "./components/profile/Profile";
import { SimpleCreateList } from "./components/shared/SimpleCreateList";
import TravelHistory from "./components/history/TravelHistory";
import {
  emptyAircraft,
  emptyFlight,
  emptyPassenger,
  emptySchedule,
  aircraftFields,
  flightFields,
  passengerFields,
  roleTabs,
  scheduleFields,
} from "./lib/constants";

export function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("skybook.session");
    return raw ? JSON.parse(raw) : null;
  });
  const [active, setActive] = useState(session?.role === "ADMIN" ? "dashboard" : "search");
  const [paymentBookings, setPaymentBookings] = useState(null);
  // Set by the "Book now" CTA on a flight search result. Bookings reads this
  // once, to try to jump straight to that flight's schedule, then clears it.
  const [bookingIntentFlightId, setBookingIntentFlightId] = useState(null);
  // Admin equivalent of the CTA above. Admins can't create bookings — the
  // backend's createBooking/createBookings endpoints are @PreAuthorize
  // "hasRole('USER')" only — so "Book now" for an admin instead narrows the
  // bookings monitoring view to that specific flight's bookings.
  const [adminFlightFilter, setAdminFlightFilter] = useState(null);
  // Controls what a logged-out visitor sees: the landing page, or the auth
  // form (with a preset login/register tab, set by the navbar buttons).
  const [publicView, setPublicView] = useState({ screen: "landing", authMode: "login" });

  useEffect(() => {
    if (session) localStorage.setItem("skybook.session", JSON.stringify(session));
    else localStorage.removeItem("skybook.session");
  }, [session]);

  const signOut = () => {
    setSession(null);
    setActive("search");
    setPublicView({ screen: "landing", authMode: "login" });
  };

  const goToPayment = (bookings) => {
    setPaymentBookings(bookings);
    setActive("pay-now");
  };

  const leavePayment = () => {
    setPaymentBookings(null);
    setActive("bookings");
  };

  const bookFlight = (flightId) => {
    setBookingIntentFlightId(flightId);
    setActive("bookings");
  };

  const viewFlightBookings = (flightId) => {
    setAdminFlightFilter(flightId);
    setActive("bookings");
  };

  if (!session) {
    if (publicView.screen === "auth") {
      return (
        <AuthScreen
          initialMode={publicView.authMode}
          onAuth={setSession}
          onBack={() => setPublicView({ screen: "landing", authMode: "login" })}
        />
      );
    }
    return (
      <LandingPage
        onLogin={() => setPublicView({ screen: "auth", authMode: "login" })}
        onRegister={() => setPublicView({ screen: "auth", authMode: "register" })}
      />
    );
  }

  const tabs = roleTabs[session.role] || roleTabs.USER;

  return (
    <div className="shell">
      <Sidebar session={session} tabs={tabs} active={active} onNavigate={setActive} onSignOut={signOut} />
      <main className="workspace">
        {active === "dashboard" && <AdminDashboard session={session} />}
        {active === "search" && (
          <FlightSearch session={session} onBook={session.role === "ADMIN" ? viewFlightBookings : bookFlight} />
        )}
        {active === "flights" && (
          <CrudPanel
            title="Flights"
            resource="flights"
            empty={emptyFlight}
            fields={flightFields}
            idKey="id"
            session={session}
            extraActions={(row) => (
              <button type="button" className="primary cta-small" onClick={() => viewFlightBookings(row.id)}>
                View bookings
              </button>
            )}
          />
        )}
        {active === "aircraft" && (
          <CrudPanel title="Aircraft" resource="aircrafts" empty={emptyAircraft} fields={aircraftFields} idKey="id" session={session} />
        )}
        {active === "fleet" && <AircraftFleetView session={session} />}
        {active === "schedules" && (
          <CrudPanel title="Schedules" resource="schedules" empty={emptySchedule} fields={scheduleFields} idKey="id" session={session} />
        )}
        {active === "seats" && <AdminSeatsPanel session={session} />}
        {active === "users" && <AdminUsersPanel session={session} />}
        {active === "bookings" && (
          <Bookings
            session={session}
            onPay={goToPayment}
            intentFlightId={bookingIntentFlightId}
            onIntentConsumed={() => setBookingIntentFlightId(null)}
            adminFlightFilter={adminFlightFilter}
            onAdminFilterConsumed={() => setAdminFlightFilter(null)}
          />
        )}
        {active === "passengers" && (
          <SimpleCreateList
            title="Passengers"
            subtitle="Unique passengers by passport number — the same person may appear on several bookings."
            resource="passengers"
            empty={emptyPassenger}
            fields={passengerFields}
            session={session}
            dedupeBy="passportNumber"
          />
        )}
        {active === "history" && <PaymentHistory session={session} />}
        {active === "travel-history" && (<TravelHistory session={session} />)}
        {active === "tickets" && <Tickets session={session} />}
        {active === "profile" && <Profile session={session} />}
        {active === "pay-now" && paymentBookings && paymentBookings.length > 0 && (
          <PaymentFlow bookings={paymentBookings} session={session} onDone={leavePayment} />
        )}

      </main>
    </div>
  );
}
