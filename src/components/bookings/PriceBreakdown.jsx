import { SEAT_TYPE_SURCHARGE } from "../../lib/constants";

// Client-side price estimate for the seats currently selected in the
// booking flow. Surcharges here are NOT charged by the backend today (see
// SEAT_TYPE_SURCHARGE) — this exists so the user isn't surprised later, and
// should be replaced with real figures once the API returns per-seat pricing.
export function PriceBreakdown({ baseFare, seats }) {
  const rows = seats.map((seat) => ({
    seat,
    surcharge: SEAT_TYPE_SURCHARGE[seat.seatType] ?? 0,
  }));
  const fareTotal = baseFare * seats.length;
  const surchargeTotal = rows.reduce((sum, r) => sum + r.surcharge, 0);
  const tax = Math.round((fareTotal + surchargeTotal) * 0.05); // GST estimate, 5%
  const grandTotal = fareTotal + surchargeTotal + tax;

  return (
    <div className="price-breakdown">
      <h4>Estimated price</h4>
      <ul className="price-breakdown-lines">
        <li>
          <span>Base fare &times; {seats.length}</span>
          <span className="mono">₹{fareTotal.toFixed(2)}</span>
        </li>
        {rows.map(({ seat, surcharge }) => (
          <li key={seat.seatId} className="price-breakdown-subline">
            <span>Seat {seat.seatNumber} &middot; {seat.seatType.toLowerCase()}{surcharge ? " preference" : ""}</span>
            <span className="mono">{surcharge ? `+₹${surcharge.toFixed(2)}` : "included"}</span>
          </li>
        ))}
        <li>
          <span>Taxes (GST, est. 5%)</span>
          <span className="mono">₹{tax.toFixed(2)}</span>
        </li>
      </ul>
      <div className="price-breakdown-total">
        <span>Estimated total</span>
        <span className="mono">₹{grandTotal.toFixed(2)}</span>
      </div>
      <p className="price-breakdown-note">
        Estimate — matches the server's pricing rules, but the confirmed, itemized amount is returned when you reserve.
      </p>
    </div>
  );
}
