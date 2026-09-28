export function SeatCell({ seat, selectedSeatIds, onToggle }) {
  if (!seat) return <span className="seat-map-empty" />;
  const isBooked = seat.status === "BOOKED";
  const isSelected = selectedSeatIds.includes(seat.seatId);
  return (
    <button
      type="button"
      disabled={isBooked}
      className={`seat-cell ${isBooked ? "booked" : "available"} ${isSelected ? "selected" : ""}`}
      onClick={() => onToggle(seat)}
      title={`${seat.seatNumber} · ${seat.seatClass} · ${seat.seatType}`}
    >
      {seat.seatNumber}
    </button>
  );
}
