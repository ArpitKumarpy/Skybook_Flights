import { Download, Plane } from "lucide-react";

export function TicketCard({ ticket, booking, schedule, passenger, seat, onDownload, onCancel }) {
  const passengerName = passenger ? [passenger.firstName, passenger.lastName].filter(Boolean).join(" ") : null;
  const status = ticket.ticketStatus || booking?.bookingStatus;

  return (
    <article className="boarding-pass">
      <div className="boarding-pass-main">
        <div className="boarding-pass-row boarding-pass-route">
          <div>
            <span className="boarding-pass-label">From</span>
            <strong className="mono">{schedule?.source || "—"}</strong>
          </div>
          <Plane size={18} className="boarding-pass-plane" />
          <div>
            <span className="boarding-pass-label">To</span>
            <strong className="mono">{schedule?.destination || "—"}</strong>
          </div>
        </div>
        <div className="boarding-pass-row boarding-pass-details">
          <div>
            <span className="boarding-pass-label">Passenger</span>
            <strong>{passengerName || "—"}</strong>
          </div>
          <div>
            <span className="boarding-pass-label">Travel date</span>
            <strong className="mono">
              {schedule?.departureDate || "—"}{schedule?.departureTime ? ` · ${schedule.departureTime}` : ""}
            </strong>
          </div>
        </div>
        <div className="boarding-pass-row boarding-pass-details">
          <div>
            <span className="boarding-pass-label">Flight</span>
            <strong className="mono">{schedule?.flightNumber || "—"}</strong>
          </div>
          <div>
            <span className="boarding-pass-label">Seat</span>
            <strong className="mono">{seat?.seatNumber || "—"}</strong>
          </div>
        </div>
      </div>
      <div className="boarding-pass-stub">
        <span className="boarding-pass-label">Ticket</span>
        <strong className="mono">{ticket.ticketNumber || ticket.id}</strong>
        {status && <span className={`status-pill status-${String(status).toLowerCase()}`}>{status}</span>}
        <div className="boarding-pass-actions">
          {onDownload && (
            <button type="button" className="secondary icon-text" onClick={onDownload}>
              <Download size={14} /> PDF
            </button>
          )}
          {onCancel && status !== "CANCELLED" && (
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
