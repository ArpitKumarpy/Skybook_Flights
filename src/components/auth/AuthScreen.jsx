import { useState } from "react";
import { Plane } from "lucide-react";
import { api } from "../../lib/api";
import { pick, validateRequired } from "../../lib/utils";
import { Field } from "../common/Field";

export function AuthScreen({ onAuth, initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const authFields =
    mode === "login"
      ? [{ name: "email", label: "Email" }, { name: "password", label: "Password" }]
      : [
          { name: "firstName", label: "First name" },
          { name: "lastName", label: "Last name" },
          { name: "phoneNumber", label: "Phone number" },
          { name: "email", label: "Email" },
          { name: "password", label: "Password" },
        ];

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const errors = validateRequired(form, authFields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      const payload = mode === "login" ? pick(form, ["email", "password"]) : form;
      const data = await api.publicPost(`/auth/${mode}`, payload);
      onAuth({ ...data, role: data.role?.replace("ROLE_", "") });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
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
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand wide">
            <Plane size={30} />
            <div>
              <strong>SkyBook</strong>
              <span>Flight booking system</span>
            </div>
          </div>
          <h1>Book Flights, Pick your Favorite seats, Search Destinations, and Book tickets from one Platform!</h1>
          {onBack && (
            <button type="button" className="auth-back-link" onClick={onBack}>
              &larr; Back to SkyBook.com
            </button>
          )}
        </div>
        <form className="login-card" onSubmit={submit}>
          <div className="segmented">
            <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Register</button>
          </div>
          {mode === "register" && (
            <div className="grid two">
              <Field label="First name" value={form.firstName} {...fieldProps("firstName")} />
              <Field label="Last name" value={form.lastName} {...fieldProps("lastName")} />
              <Field label="Phone number" value={form.phoneNumber} {...fieldProps("phoneNumber")} />
            </div>
          )}
          <Field label="Email" type="email" value={form.email} {...fieldProps("email")} />
          <Field label="Password" type="password" value={form.password} {...fieldProps("password")} />
          {error && <div className="error">{error}</div>}
          <button className="primary" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</button>
        </form>
      </section>
    </main>
  );
}
