import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { rowsOf } from "../../lib/utils";
import { Header } from "../common/Header";
import { Field } from "../common/Field";
import { SeatMap } from "../bookings/SeatMap";

// Admin-only: pick an aircraft and see its full seat layout, independent of
// any specific schedule. Reuses SeatMap in a read-only "reference" mode
// (no booked/selected states, since these are raw aircraft seat records).
export function AircraftFleetView({ session }) {
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");
  const [seats, setSeats] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/aircrafts", session).then((data) => setAircraftList(rowsOf(data))).catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAircraftId) {
      setSeats([]);
      return;
    }
    setLoading(true);
    setError("");
    api
      .get(`/seats/aircraft/${selectedAircraftId}`, session)
      .then((data) => setSeats(rowsOf(data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAircraftId]);

  // /seats returns raw seat records (seatNumber/seatClass/seatType/id), not
  // the availability-shaped records SeatMap normally expects (seatId/status).
  // Adapt the shape here so the fleet view can reuse the same grid component.
  const seatMapRows = seats.map((seat) => ({
    seatId: seat.id,
    seatNumber: seat.seatNumber,
    seatClass: seat.seatClass,
    seatType: seat.seatType,
    status: "AVAILABLE",
  }));

  return (
    <section>
      <Header title="Fleet Seat Map" subtitle="Visual seat layout for any aircraft model, independent of scheduling." />
      <Field
        label="Aircraft"
        value={selectedAircraftId}
        onChange={setSelectedAircraftId}
        options={aircraftList.map((a) => ({ value: a.id, label: `${a.modelNo} (${a.totalSeats} seats)` }))}
      />
      {error && <div className="error">{error}</div>}
      {!selectedAircraftId && <div className="empty">Select an aircraft to view its seat layout.</div>}
      {selectedAircraftId && loading && <div className="empty">Loading seat layout...</div>}
      {selectedAircraftId && !loading && <SeatMap seats={seatMapRows} selectedSeatIds={[]} onToggle={() => {}} />}
    </section>
  );
}
