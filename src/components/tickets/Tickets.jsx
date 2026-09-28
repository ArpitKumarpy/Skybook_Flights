import { useEffect, useState } from "react";
import { api, API_BASE_URL_EXPORT } from "../../lib/api";
import { rowsOf } from "../../lib/utils";
import { Header } from "../common/Header";
import { TicketCard } from "./TicketCard";

export function Tickets({ session }) {
  const isAdmin = session.role === "ADMIN";
  const [rows, setRows] = useState([]);
  const [bookingsById, setBookingsById] = useState({});
  const [schedulesById, setSchedulesById] = useState({});
  const [passengersByBookingId, setPassengersByBookingId] = useState({});
  const [seatsByScheduleId, setSeatsByScheduleId] = useState({});
  const [error, setError] = useState("");

  // TicketResponseDto only carries {id, ticketNumber, bookingId, ticketStatus,
  // issueDate} — nothing about route, passenger, or seat. Assemble those by
  // joining in Booking (scheduleId, seatId) and Schedule (which conveniently
  // already denormalizes source/destination/flightNumber, so no separate
  // /flights call is needed). Passenger and seat details come from
  // role-appropriate endpoints (GET /seats/{id} is admin-only, so seat
  // number is read via /seats/availability/{scheduleId} instead, which any
  // authenticated user can call), fetched once per distinct booking/schedule
  // referenced by these tickets rather than once per ticket.
  const load = async () => {
    setError("");
    try {
      const [ticketData, bookingData, scheduleData] = await Promise.all([
        api.get("/tickets", session),
        api.get("/bookings", session),
        api.get("/schedules", session),
      ]);
      const ticketRows = rowsOf(ticketData);
      const bookingRows = rowsOf(bookingData);
      const scheduleRows = rowsOf(scheduleData);
      const nextBookingsById = Object.fromEntries(bookingRows.map((b) => [b.id, b]));
      const nextSchedulesById = Object.fromEntries(scheduleRows.map((s) => [s.id, s]));

      const bookingIds = [...new Set(ticketRows.map((t) => t.bookingId).filter((id) => id != null))];
      const scheduleIds = [...new Set(bookingIds.map((id) => nextBookingsById[id]?.scheduleId).filter((id) => id != null))];

      const [passengerLists, seatLists] = await Promise.all([
        Promise.all(bookingIds.map((id) => api.get(`/passengers/booking/${id}`, session).then(rowsOf).catch(() => []))),
        Promise.all(scheduleIds.map((id) => api.get(`/seats/availability/${id}`, session).then(rowsOf).catch(() => []))),
      ]);

      setRows(ticketRows);
      setBookingsById(nextBookingsById);
      setSchedulesById(nextSchedulesById);
      setPassengersByBookingId(Object.fromEntries(bookingIds.map((id, i) => [id, passengerLists[i]])));
      setSeatsByScheduleId(Object.fromEntries(scheduleIds.map((id, i) => [id, seatLists[i]])));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin path: DELETE /tickets/{id} (admin-only cancelTicket).
  const removeAsAdmin = async (ticket) => {
    if (!window.confirm(`Cancel ticket ${ticket.ticketNumber}?`)) return;
    setError("");
    try {
      await api.delete(`/tickets/${ticket.id}`, session);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  // User path: tickets aren't user-cancellable directly (that endpoint is
  // admin-only) — cancelling the underlying booking is what a user can do,
  // and it's the same real-world action ("cancel my ticket").
  const cancelAsUser = async (ticket) => {
    if (!window.confirm("Cancel this booking? This can't be undone.")) return;
    setError("");
    try {
      await api.patch(`/bookings/${ticket.bookingId}/cancel`, {}, session);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const download = async (row) => {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL_EXPORT}/tickets/${row.id}/download`, {
        headers: {
          Authorization: `${session.tokenType || "Bearer"} ${session.token}`,
        },
      });
      if (!response.ok) throw new Error("Could not download ticket");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${row.ticketNumber || row.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <Header title="Tickets" subtitle={isAdmin ? "All tickets issued across bookings." : "View and download your tickets."} />
      {error && <div className="error">{error}</div>}
      {!rows.length && <div className="empty">No tickets found.</div>}
      <div className="boarding-pass-grid">
        {rows.map((row) => {
          const booking = bookingsById[row.bookingId];
          const schedule = booking ? schedulesById[booking.scheduleId] : null;
          const passengers = passengersByBookingId[row.bookingId] || [];
          const seat = booking && schedule
            ? (seatsByScheduleId[schedule.id] || []).find((s) => s.seatId === booking.seatId)
            : null;
          return (
            <TicketCard
              key={row.id}
              ticket={row}
              booking={booking}
              schedule={schedule}
              passenger={passengers[0]}
              seat={seat}
              onDownload={() => download(row)}
              onCancel={isAdmin ? () => removeAsAdmin(row) : () => cancelAsUser(row)}
            />
          );
        })}
      </div>
    </section>
  );
}
