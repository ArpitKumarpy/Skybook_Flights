import { useMemo } from "react";
import { format } from "../../lib/utils";
import { HIDDEN_COLUMNS } from "../../lib/constants";

export function DataTable({ rows, onEdit, onDelete, extraActions }) {
  const columns = useMemo(
    () => Array.from(new Set(rows.flatMap((row) => Object.keys(row || {})))).filter((c) => !HIDDEN_COLUMNS.has(c)).slice(0, 10),
    [rows]
  );
  if (!rows.length) return <div className="empty">No records found.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
            {(onEdit || onDelete || extraActions) && <th>actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || row.passengerId || row.ticketNumber || index}>
              {columns.map((column) => <td key={column}>{format(row[column])}</td>)}
              {(onEdit || onDelete || extraActions) && (
                <td className="row-actions">
                  {onEdit && <button onClick={() => onEdit(row)}>Edit</button>}
                  {onDelete && <button onClick={() => onDelete(row)}>Delete</button>}
                  {extraActions?.(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
