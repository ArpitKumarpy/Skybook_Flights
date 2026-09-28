import { useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import { clean, rowsOf, validateRequired } from "../../lib/utils";
import { Header } from "../common/Header";
import { Field } from "../common/Field";
import { DataTable } from "../common/DataTable";

export function FlightSearch({ session, onBook }) {
  const [query, setQuery] = useState({ source: "", destination: "", departureDate: "" });
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const isAdmin = session.role === "ADMIN";

  const searchFields = [
    { name: "source", label: "Source" },
    { name: "destination", label: "Destination" },
    { name: "departureDate", label: "Departure date" },
  ];

  const search = async (event) => {
    event.preventDefault();
    setError("");
    const errors = validateRequired(query, searchFields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    const qs = new URLSearchParams(clean(query)).toString();
    try {
      setResults(rowsOf(await api.get(`/flights/search?${qs}`, session)));
    } catch (err) {
      setError(err.message);
    }
  };

  const fieldProps = (name) => ({
    error: fieldErrors[name],
    onChange: (value) => {
      setQuery({ ...query, [name]: value });
      if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: undefined });
    },
  });

  return (
    <section>
      <Header
        title="Find Flights"
        subtitle={isAdmin ? "Search flights and jump straight to their bookings." : "Search public flight availability and create bookings as a user."}
      />
      <form className="toolbar" onSubmit={search}>
        <Field label="Source" value={query.source} {...fieldProps("source")} />
        <Field label="Destination" value={query.destination} {...fieldProps("destination")} />
        <Field label="Departure date" type="date" value={query.departureDate} {...fieldProps("departureDate")} />
        <button className="primary icon-text"><Search size={18} />Search</button>
      </form>
      {error && <div className="error">{error}</div>}
      <DataTable
        rows={results}
        extraActions={
          onBook
            ? (row) => (
                <button type="button" className="primary cta-small" onClick={() => onBook(row.id)}>
                  {isAdmin ? "View bookings" : "Book now"}
                </button>
              )
            : undefined
        }
      />
    </section>
  );
}
