import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { normalizePayload, rowsOf } from "../../lib/utils";
import { Header } from "../common/Header";
import { Field } from "../common/Field";
import { DataTable } from "../common/DataTable";

export function SimpleCreateList({ title, subtitle, resource, empty, fields, session, deletable = false, dedupeBy }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      setRows(rowsOf(await api.get(`/${resource}`, session)));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const create = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/${resource}`, normalizePayload(form, fields), session);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (row) => {
    try {
      await api.delete(`/${resource}/${row.id || row.passengerId}`, session);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Display-only: the same person can end up with multiple passenger rows
  // (one per booking they've been added to), so show only the first row per
  // distinct passport number. Create/edit/delete still operate on the real,
  // un-deduped records underneath — this doesn't change what's stored or
  // how those actions work, only what's listed.
  const displayRows = useMemo(() => {
    if (!dedupeBy) return rows;
    const seen = new Set();
    return rows.filter((row) => {
      const key = row[dedupeBy];
      if (key == null || key === "") return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rows, dedupeBy]);

  return (
    <section>
      <Header title={title} subtitle={subtitle || "Connected directly to the matching backend endpoint."} />
      {session.role === "USER" && (
        <form className="editor compact" onSubmit={create}>
          {fields.map((field) => (
            <Field key={field.name} {...field} value={form[field.name] ?? ""} onChange={(value) => setForm({ ...form, [field.name]: value })} />
          ))}
          <button className="primary">Create</button>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      <DataTable rows={displayRows} onDelete={deletable ? remove : undefined} />
    </section>
  );
}
