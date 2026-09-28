import { useMemo } from "react";
import { formatSeatClass, parseSeat } from "../../lib/utils";
import { SeatCell } from "./SeatCell";

export function SeatMap({ seats, selectedSeatIds, onToggle }) {
  const rows = useMemo(() => {
    const byRow = new Map();
    seats.forEach((seat) => {
      const { row, letter } = parseSeat(seat.seatNumber);
      if (!byRow.has(row)) byRow.set(row, {});
      byRow.get(row)[letter] = seat;
    });
    return Array.from(byRow.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  // Rows are generated contiguously by class (see AircraftServiceImpl.resolveClass),
  // so grouping consecutive rows that share a class gives clean sections —
  // reads the class straight off the seat data rather than re-deriving it
  // from row numbers, so it stays correct even if that backend logic changes.
  const sections = useMemo(() => {
    const result = [];
    let current = null;
    rows.forEach(([rowNumber, seatsInRow]) => {
      const seatClass = Object.values(seatsInRow).find(Boolean)?.seatClass || "UNKNOWN";
      if (!current || current.seatClass !== seatClass) {
        current = { seatClass, rows: [] };
        result.push(current);
      }
      current.rows.push([rowNumber, seatsInRow]);
    });
    return result;
  }, [rows]);

  const leftCols = ["A", "B", "C"];
  const rightCols = ["D", "E", "F"];

  if (!rows.length) return <div className="empty">No seats available for this schedule.</div>;

  return (
    <div className="seat-map">
      <div className="seat-map-header">
        <span className="seat-map-row-label" />
        {leftCols.map((letter) => <span key={letter} className="seat-map-col-label">{letter}</span>)}
        <span className="seat-map-aisle-label" />
        {rightCols.map((letter) => <span key={letter} className="seat-map-col-label">{letter}</span>)}
      </div>
      {sections.map((section, sectionIndex) => (
        <div className="seat-map-section" key={sectionIndex}>
          <div className="seat-map-section-title">
            <span>{formatSeatClass(section.seatClass)}</span>
          </div>
          {section.rows.map(([rowNumber, seatsInRow]) => (
            <div className="seat-map-row" key={rowNumber}>
              <span className="seat-map-row-label">{rowNumber}</span>
              {leftCols.map((letter) => (
                <SeatCell key={letter} seat={seatsInRow[letter]} selectedSeatIds={selectedSeatIds} onToggle={onToggle} />
              ))}
              <span className="seat-map-aisle" />
              {rightCols.map((letter) => (
                <SeatCell key={letter} seat={seatsInRow[letter]} selectedSeatIds={selectedSeatIds} onToggle={onToggle} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
