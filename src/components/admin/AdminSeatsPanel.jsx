import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { normalizePayload, rowsOf, validateRequired } from "../../lib/utils";
import { emptySeat, seatFields } from "../../lib/constants";
import { Header } from "../common/Header";
import { Field } from "../common/Field";
import { DataTable } from "../common/DataTable";

// Admin corrections view for seats — grouped by aircraft via a dropdown so
// the list stays scoped to one aircraft at a time instead of mixing every
// seat from every aircraft into one table.
export function AdminSeatsPanel({ session }) {
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySeat);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/aircrafts", session).then((data) => setAircraftList(rowsOf(data))).catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (aircraftId) => {
    if (!aircraftId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setRows(rowsOf(await api.get(`/seats/aircraft/${aircraftId}`, session)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(selectedAircraftId);
    setEditingId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAircraftId]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({ seatNumber: row.seatNumber, seatClass: row.seatClass, seatType: row.seatType, aircraftId: selectedAircraftId });
    setFieldErrors({});
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    const errors = validateRequired(form, seatFields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      await api.put(`/seats/${editingId}`, normalizePayload(form, seatFields), session);
      setEditingId(null);
      await load(selectedAircraftId);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete seat ${row.seatNumber}?`)) return;
    setError("");
    try {
      await api.delete(`/seats/${row.id}`, session);
      await load(selectedAircraftId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <Header
        title="Seats"
        subtitle="Seats are generated automatically when an aircraft is created. Pick an aircraft below to review or correct its layout."
      />
      <Field
        label="Aircraft"
        value={selectedAircraftId}
        onChange={setSelectedAircraftId}
        options={aircraftList.map((a) => ({ value: a.id, label: `${a.modelNo} (${a.totalSeats} seats)` }))}
      />
      {error && <div className="error">{error}</div>}
      {!selectedAircraftId && <div className="empty">Select an aircraft to view its seats.</div>}
      {selectedAircraftId && loading && <div className="empty">Loading seats...</div>}

      {selectedAircraftId && !loading && editingId && (
        <form className="editor compact" onSubmit={save}>
          {seatFields.filter((f) => f.name !== "aircraftId").map((field) => (
            <Field
              key={field.name}
              {...field}
              value={form[field.name] ?? ""}
              error={fieldErrors[field.name]}
              onChange={(value) => {
                setForm({ ...form, [field.name]: value });
                if (fieldErrors[field.name]) setFieldErrors({ ...fieldErrors, [field.name]: undefined });
              }}
            />
          ))}
          <div className="form-actions">
            <button className="primary">Save</button>
            <button type="button" className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
          </div>
        </form>
      )}

      {selectedAircraftId && !loading && !editingId && (
        <DataTable rows={rows} onEdit={startEdit} onDelete={remove} />
      )}
    </section>
  );
}
