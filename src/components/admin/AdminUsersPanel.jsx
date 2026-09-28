import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { rowsOf } from "../../lib/utils";
import { Header } from "../common/Header";

// Admin can only ever change a user's role. Assumes the backend exposes
// PATCH /users/{id}/role — if it only has PUT /users/{id}, make sure that
// endpoint ignores/rejects any field other than role when called by an admin.
export function AdminUsersPanel({ session }) {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      setRows(rowsOf(await api.get("/users", session)));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row) => {
    setEditingId(row.id);
    setRole(row.role || "USER");
  };

  const saveRole = async (row) => {
    setError("");
    try {
      await api.patch(`/users/${row.id}/role`, { role }, session);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (row) => {
    if (!window.confirm(`Delete ${row.email}? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/users/${row.id}`, session);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <Header title="Users" subtitle="Admins can only change a user's role, not their personal details." />
      {error && <div className="error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.firstName} {row.lastName}</td>
                <td>{row.email}</td>
                <td>{row.phoneNumber}</td>
                <td>
                  {editingId === row.id ? (
                    <select value={role} onChange={(event) => setRole(event.target.value)}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    row.role
                  )}
                </td>
                <td className="row-actions">
                  {editingId === row.id ? (
                    <>
                      <button onClick={() => saveRole(row)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(row)}>Edit role</button>
                      <button onClick={() => removeUser(row)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="empty">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
