import { useState } from "react";
import { api } from "../../lib/api";
import { Header } from "../common/Header";
import { Field } from "../common/Field";

// USER-only: reached via the "Pay now" button on a booking, not from the sidebar.
export function PaymentFlow({ bookings, session, onDone }) {
  const [method, setMethod] = useState("UPI");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  const groupRef = bookings[0]?.groupBookingReference;

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      if (bookings.length === 1) {
        await api.post("/payments", { bookingId: bookings[0].id, paymentMethod: method }, session);
      } else {
        await api.post("/payments/batch", { bookingIds: bookings.map((b) => b.id), paymentMethod: method }, session);
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <Header
        title="Complete payment"
        subtitle={bookings.length === 1 ? `Booking #${bookings[0].id}` : `${bookings.length} bookings · Total ₹${total.toFixed(2)}`}
      />
      <div className="editor compact">
        {groupRef && bookings.length > 1 && (
          <div className="group-reference-banner">
            All {bookings.length} seats in this checkout are tied to booking group <span className="mono">{groupRef}</span>.
          </div>
        )}
        <div className="price-breakdown">
          <h4>Itemized total{bookings.length > 1 ? " (all seats)" : ""}</h4>
          <ul className="price-breakdown-lines">
            {bookings.map((b) => (
              <li key={b.id} className="price-breakdown-subline">
                <span>Seat booking {b.bookingReference} &middot; base ₹{Number(b.baseFare).toFixed(2)} + surcharge ₹{Number(b.seatSurcharge).toFixed(2)} + GST ₹{Number(b.gstAmount).toFixed(2)}</span>
                <span className="mono">₹{Number(b.totalAmount).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="price-breakdown-total">
            <span>Total due</span>
            <span className="mono">₹{total.toFixed(2)}</span>
          </div>
        </div>
        <Field
          label="Payment method"
          name="paymentMethod"
          value={method}
          onChange={setMethod}
          options={["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "WALLET"]}
        />
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button className="primary" disabled={busy} onClick={confirm}>
            {busy ? "Processing..." : `Confirm payment${bookings.length > 1 ? ` (₹${total.toFixed(2)})` : ""}`}
          </button>
          <button type="button" className="secondary" onClick={onDone}>Cancel</button>
        </div>
      </div>
    </section>
  );
}
