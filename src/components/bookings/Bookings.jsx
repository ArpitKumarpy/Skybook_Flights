import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { rowsOf, validateRequired } from "../../lib/utils";
import { emptyPassengerForm } from "../../lib/constants";
import { Header } from "../common/Header";
import { Field } from "../common/Field";
import { DataTable } from "../common/DataTable";
import { SeatMap } from "./SeatMap";
import { PriceBreakdown } from "./PriceBreakdown";

export function Bookings({ session, onPay, intentFlightId, onIntentConsumed, adminFlightFilter, onAdminFilterConsumed }) {
  const isAdmin = session.role === "ADMIN";
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const [schedules, setSchedules] = useState([]);
  const schedulesById = useMemo(() => Object.fromEntries(schedules.map((s) => [s.id, s])), [schedules]);
  const [flightsById, setFlightsById] = useState({});
  const [step, setStep] = useState("choose-schedule");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerForms, setPassengerForms] = useState({}); // seatId -> form
  const [passengerFieldErrors, setPassengerFieldErrors] = useState({}); // seatId -> { field: message }
  const [reserving, setReserving] = useState(false);

  const load = async () => {
    setError("");
    try {
      setRows(rowsOf(await api.get("/bookings", session)));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    Promise.all([api.get("/schedules", session), api.get("/flights", session)])
      .then(([scheduleData, flightData]) => {
        setSchedules(rowsOf(scheduleData));
        setFlightsById(Object.fromEntries(rowsOf(flightData).map((f) => [f.id, f])));
      })
      .catch((err) => setError(err.message));
  }, []);

  // If the user arrived here via a "Book now" CTA on a search result, try to
  // jump straight to a schedule for that flight once schedules have loaded.
  // If there's more than one schedule for the flight, we fall back to the
  // normal picker instead of guessing which departure they want.
  useEffect(() => {
    if (isAdmin || !intentFlightId || !schedules.length) return;
    const matches = schedules.filter((s) => s.flightId === intentFlightId);
    if (matches.length === 1) pickSchedule(matches[0]);
    onIntentConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, intentFlightId, schedules]);

  const pickSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setPassengerForms({});
    setStep("choose-seat");
    setError("");
    try {
      setSeats(rowsOf(await api.get(`/seats/availability/${schedule.id}`, session)));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSeat = (seat) => {
    if (seat.status === "BOOKED") return;
    setSelectedSeats((current) => {
      const alreadyPicked = current.some((s) => s.seatId === seat.seatId);
      if (alreadyPicked) {
        setPassengerForms((forms) => {
          const next = { ...forms };
          delete next[seat.seatId];
          return next;
        });
        return current.filter((s) => s.seatId !== seat.seatId);
      }
      setPassengerForms((forms) => ({ ...forms, [seat.seatId]: emptyPassengerForm }));
      return [...current, seat];
    });
  };

  const updatePassengerField = (seatId, field, value) => {
    setPassengerForms((forms) => ({
      ...forms,
      [seatId]: { ...forms[seatId], [field]: value },
    }));
  };

  const goToPassengerStep = () => {
    if (!selectedSeats.length) return;
    setStep("passenger-details");
  };

  const requiredPassengerFields = [
    { name: "firstName", label: "First name" },
    { name: "lastName", label: "Last name" },
    { name: "dateOfBirth", label: "Date of birth" },
    { name: "passportNumber", label: "Passport number" },
    { name: "nationality", label: "Nationality" },
  ];

  const reserve = async () => {
    if (!selectedSchedule || !selectedSeats.length) return;
    setError("");

    const nextErrors = {};
    selectedSeats.forEach((seat) => {
      const errs = validateRequired(passengerForms[seat.seatId] || {}, requiredPassengerFields);
      if (Object.keys(errs).length) nextErrors[seat.seatId] = errs;
    });
    setPassengerFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setReserving(true);
    try {
      const seats = selectedSeats.map((seat) => ({
        seatId: seat.seatId,
        passenger: passengerForms[seat.seatId],
      }));
      const created = await api.post("/bookings/batch", { scheduleId: selectedSchedule.id, seats }, session);
      setStep("choose-schedule");
      setSelectedSchedule(null);
      setSelectedSeats([]);
      setPassengerForms({});
      await load();
      onPay(rowsOf(created));
    } catch (err) {
      setError(err.message);
    } finally {
      setReserving(false);
    }
  };

  const cancel = async (id) => {
    setError("");
    try {
      await api.patch(`/bookings/${id}/cancel`, {}, session);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <Header
        title="Bookings"
        subtitle={isAdmin ? "Monitor every booking made on the platform." : "Pick a schedule, choose your seats, and add passenger details."}
      />
      {error && <div className="error">{error}</div>}

      {!isAdmin && (
        <div className="booking-flow">
          {step === "choose-schedule" && (
            <div className="schedule-grid">
              {schedules.map((schedule) => {
                const flight = flightsById[schedule.flightId];
                return (
                  <button key={schedule.id} type="button" className="schedule-card" onClick={() => pickSchedule(schedule)}>
                    <strong>{flight ? `${flight.source} → ${flight.destination}` : `Flight #${schedule.flightId}`}</strong>
                    <span className="mono">{flight?.flightNumber}</span>
                    <span className="mono">Departs {schedule.departureDate} · {schedule.departureTime}</span>
                    <span className="mono">Arrives {schedule.arrivalDate} · {schedule.arrivalTime}</span>
                  </button>
                );
              })}
              {!schedules.length && <div className="empty">No schedules available right now.</div>}
            </div>
          )}

          {step === "choose-seat" && selectedSchedule && (
            <div className="seat-picker">
              <button type="button" className="secondary" onClick={() => setStep("choose-schedule")}>&larr; Back to schedules</button>
              <SeatMap seats={seats} selectedSeatIds={selectedSeats.map((s) => s.seatId)} onToggle={toggleSeat} />
              <div className="seat-legend">
                <span><i className="legend-dot available" /> Available</span>
                <span><i className="legend-dot selected" /> Selected</span>
                <span><i className="legend-dot booked" /> Booked</span>
              </div>
              <div className="seat-summary">
                {selectedSeats.length > 0
                  ? <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected: {selectedSeats.map((s) => s.seatNumber).join(", ")}</span>
                  : <span>Select one or more seats.</span>}
              </div>
              <button className="primary" disabled={!selectedSeats.length} onClick={goToPassengerStep}>
                Continue to passenger details
              </button>
            </div>
          )}

          {step === "passenger-details" && selectedSchedule && (
            <div className="passenger-details-flow">
              <button type="button" className="secondary" onClick={() => setStep("choose-seat")}>&larr; Back to seat selection</button>
              <PriceBreakdown
                baseFare={Number(flightsById[selectedSchedule.flightId]?.price || 0)}
                seats={selectedSeats}
              />
              {selectedSeats.map((seat) => (
                <div className="passenger-form-card" key={seat.seatId}>
                  <h4>Seat {seat.seatNumber} &middot; {seat.seatClass}</h4>
                  <div className="editor compact">
                    {[
                      ["firstName", "First name", "text"],
                      ["lastName", "Last name", "text"],
                    ].map(([name, label]) => (
                      <Field
                        key={name}
                        label={label}
                        value={passengerForms[seat.seatId]?.[name] ?? ""}
                        error={passengerFieldErrors[seat.seatId]?.[name]}
                        onChange={(v) => {
                          updatePassengerField(seat.seatId, name, v);
                          if (passengerFieldErrors[seat.seatId]?.[name]) {
                            setPassengerFieldErrors((cur) => ({ ...cur, [seat.seatId]: { ...cur[seat.seatId], [name]: undefined } }));
                          }
                        }}
                      />
                    ))}
                    <Field label="Gender" value={passengerForms[seat.seatId]?.gender ?? "MALE"} onChange={(v) => updatePassengerField(seat.seatId, "gender", v)} options={["MALE", "FEMALE", "OTHER"]} />
                    {[
                      ["dateOfBirth", "Date of birth", "date"],
                      ["passportNumber", "Passport number", "text"],
                      ["nationality", "Nationality", "text"],
                    ].map(([name, label, type]) => (
                      <Field
                        key={name}
                        label={label}
                        type={type}
                        value={passengerForms[seat.seatId]?.[name] ?? ""}
                        error={passengerFieldErrors[seat.seatId]?.[name]}
                        onChange={(v) => {
                          updatePassengerField(seat.seatId, name, v);
                          if (passengerFieldErrors[seat.seatId]?.[name]) {
                            setPassengerFieldErrors((cur) => ({ ...cur, [seat.seatId]: { ...cur[seat.seatId], [name]: undefined } }));
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <button className="primary" disabled={reserving} onClick={reserve}>
                {reserving ? "Reserving..." : `Reserve ${selectedSeats.length} seat${selectedSeats.length === 1 ? "" : "s"}`}
              </button>
            </div>
          )}
        </div>
      )}

      {isAdmin && adminFlightFilter && (
        <div className="group-reference-banner">
          Showing bookings for flight #{adminFlightFilter} only.{" "}
          <button type="button" className="secondary cta-small" onClick={onAdminFilterConsumed}>Clear filter</button>
        </div>
      )}

      <DataTable
        rows={
          isAdmin && adminFlightFilter
            ? rows.filter((r) => schedulesById[r.scheduleId]?.flightId === adminFlightFilter)
            : rows
        }
        extraActions={
          isAdmin
            ? undefined
            : (row) => (
                <>
                  {row.bookingStatus !== "CONFIRMED" && row.bookingStatus !== "CANCELLED" && (
                    <>
                      <button onClick={() => cancel(row.id)}>Cancel</button>
                      <button onClick={() => onPay([row])}>Pay now</button>
                    </>
                  )}
                </>
              )
        }
      />
    </section>
  );
}
