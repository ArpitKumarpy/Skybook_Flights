import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { validateRequired } from "../../lib/utils";
import { Header } from "../common/Header";
import { Field } from "../common/Field";

// USER-only: edit their own profile. Assumes GET/PUT /users/{id} is allowed
// for the owning user (not just admins).
export function Profile({ session }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "" });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    api.get(`/users/${session.userId}`, session)
      .then((data) => {
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
        });
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileFields = [
    { name: "firstName", label: "First name" },
    { name: "lastName", label: "Last name" },
    { name: "email", label: "Email" },
    { name: "phoneNumber", label: "Phone number" },
  ];

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    const errors = validateRequired(form, profileFields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      await api.put(`/users/${session.userId}`, form, session);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const fieldProps = (name) => ({
    error: fieldErrors[name],
    onChange: (value) => {
      setForm({ ...form, [name]: value });
      if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: undefined });
    },
  });

  return (
    <section>
      <Header title="My Profile" subtitle="Update your personal details." />
      {!loaded ? (
        <div className="empty">Loading...</div>
      ) : (
        <form className="editor" onSubmit={save}>
          <Field label="First name" value={form.firstName} {...fieldProps("firstName")} />
          <Field label="Last name" value={form.lastName} {...fieldProps("lastName")} />
          <Field label="Email" type="email" value={form.email} {...fieldProps("email")} />
          <Field label="Phone number" value={form.phoneNumber} {...fieldProps("phoneNumber")} />
          {error && <div className="error">{error}</div>}
          {saved && <div className="success">Profile updated.</div>}
          <div className="form-actions">
            <button className="primary">Save changes</button>
          </div>
        </form>
      )}
    </section>
  );
}
