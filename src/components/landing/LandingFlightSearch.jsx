import { useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import { clean, rowsOf, validateRequired } from "../../lib/utils";
import { Field } from "../common/Field";

// Public flight search card for the landing page — mirrors FlightSearch but
// doesn't require a session, since GET /flights/search is permitAll on the
// backend. Results just prompt sign-in to actually book.
export function LandingFlightSearch({ onLogin }) {
  const [query, setQuery] = useState({ source: "", destination: "", departureDate: "" });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
      setResults(rowsOf(await api.get(`/flights/search?${qs}`)));
      setSearched(true);
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
    <div className="landing-search-card">
      <h3>Find your flight</h3>
      <form className="landing-search-form" onSubmit={search}>
        <Field label="Source" value={query.source} {...fieldProps("source")} />
        <Field label="Destination" value={query.destination} {...fieldProps("destination")} />
        <Field label="Departure date" type="date" value={query.departureDate} {...fieldProps("departureDate")} />
        <button className="primary icon-text"><Search size={18} />Search flights</button>
      </form>
      {error && <div className="error">{error}</div>}
      {searched && (
        results.length ? (
          <ul className="landing-results">
            {results.slice(0, 5).map((flight, index) => (
              <li key={flight.id || index}>
                <div className="landing-results-info">
                  <strong>{flight.flightNumber}</strong>
                  <span>{flight.source} &rarr; {flight.destination}</span>
                  <span>{flight.airlineName}</span>
                </div>
                <button type="button" className="secondary landing-results-cta" onClick={onLogin}>
                  Login to book
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">No flights found for that route.</div>
        )
      )}
    </div>
  );
}
