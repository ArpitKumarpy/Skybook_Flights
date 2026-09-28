import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { normalizePayload, rowsOf, validateRequired } from "../../lib/utils";
import { relatedResourceConfig } from "../../lib/constants";
import { Header } from "../common/Header";
import { Field } from "../common/Field";
import { DataTable } from "../common/DataTable";

export function CrudPanel({ title, resource, empty, fields, idKey, session, hideCreateForm = false, note, extraActions }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [relatedOptions, setRelatedOptions] = useState([]);
  const relatedConfig = relatedResourceConfig[resource];

  const load = async () => {
    setError("");
    try {
      setRows(rowsOf(await api.get(`/${resource}`, session)));
    } catch (err) {
      setError(err.message);
    }
  };

  const loadRelated = async () => {
    if (!relatedConfig) return;
    try {
      setRelatedOptions(rowsOf(await api.get(`/${relatedConfig.resource}`, session)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    const errors = validateRequired(form, fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      const payload = normalizePayload(form, fields);
      if (editing) await api.put(`/${resource}/${editing}`, payload, session);
      else await api.post(`/${resource}`, payload, session);
      setForm(empty);
      setEditing(null);
      setFieldErrors({});
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (row) => {
    setEditing(row[idKey]);
    setForm(Object.fromEntries(Object.keys(empty).map((key) => [key, row[key] ?? ""])));
  };

  const remove = async (row) => {
    setError("");
    try {
      await api.delete(`/${resource}/${row[idKey]}`, session);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const processedFields = fields.map((field) => {
    if (relatedConfig && field.name === relatedConfig.field) {
      return {
        ...field,
        options: relatedOptions.map((item) => ({ value: item.id, label: relatedConfig.label(item) })),
      };
    }
    return field;
  });

  return (
    <section>
      <Header title={title} subtitle={note || "Create, update, and remove records available to admins."} />
      {!hideCreateForm && (
        <form className="editor" onSubmit={save}>
          {processedFields.map((field) => (
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
            <button className="primary">{editing ? "Update" : "Create"}</button>
            {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(empty); setFieldErrors({}); }}>Cancel</button>}
          </div>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      <DataTable rows={rows} onEdit={hideCreateForm ? undefined : edit} onDelete={remove} extraActions={extraActions} />
    </section>
  );
}
