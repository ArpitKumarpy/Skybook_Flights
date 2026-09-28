import { Armchair, Plane, Shield, Ticket } from "lucide-react";
import { LandingFlightSearch } from "./LandingFlightSearch";
import { FlightMiniGame } from "./FlightMiniGame";

export function LandingPage({ onLogin, onRegister }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <Plane size={24} />
          <strong>SkyBook</strong>
        </div>
        <nav className="landing-nav-links">
          <button type="button" onClick={() => scrollTo("home")}>Home</button>
          <button type="button" onClick={() => scrollTo("about")}>About</button>
          <button type="button" onClick={() => scrollTo("contact")}>Contact</button>
        </nav>
        <div className="landing-nav-actions">
          <button type="button" className="secondary" onClick={onLogin}>Login</button>
          <button type="button" className="primary" onClick={onRegister}>Register</button>
        </div>
      </header>

      <section id="home" className="landing-hero">
        <div className="landing-hero-copy">
          <h1>Book Flights Anywhere, Anytime. Travel the World with</h1>
          <h1 style={{ color: "#088095" }}>
            SkyBook <Plane />
          </h1>
          <p>Search live schedules, pick your seat visually, and get your e-ticket by email in seconds.</p>
        </div>
        <LandingFlightSearch onLogin={onLogin} />
      </section>

      <section id="about" className="landing-section landing-about">
        <h2>About SkyBook</h2>
        <p>
          SkyBook is a flight booking platform built for clarity: real-time seat availability,
          transparent pricing with GST built in, and a single dashboard for both travelers and
          airline operations staff.
        </p>
        <div className="landing-feature-grid">
          <article className="landing-feature">
            <Armchair size={22} />
            <h3>Visual seat selection</h3>
            <p>See the exact cabin layout — window, aisle, or middle — before you book.</p>
          </article>
          <article className="landing-feature">
            <Ticket size={22} />
            <h3>Instant e-tickets</h3>
            <p>Tickets are generated and emailed the moment payment is confirmed.</p>
          </article>
          <article className="landing-feature">
            <Shield size={22} />
            <h3>Role-aware console</h3>
            <p>Operations teams manage flights, aircraft, and schedules from one admin view.</p>
          </article>
        </div>
      </section>

      <section id="contact" className="landing-section landing-contact">
        <h2>Contact us</h2>
        <p>Have a question about a booking or partnering with SkyBook? Reach out.</p>
        <div className="landing-contact-grid">
          <div>
            <span>Email</span>
            <strong>support@skybook.com</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>+91 98765 43210</strong>
          </div>
          <div>
            <span>Office</span>
            <strong>Greater Noida, Uttar Pradesh, India</strong>
          </div>
        </div>
      </section>

      <FlightMiniGame />

      <footer className="landing-footer">
        <span>&copy; {new Date().getFullYear()} SkyBook. All rights reserved.</span>
      </footer>
    </div>
  );
}
