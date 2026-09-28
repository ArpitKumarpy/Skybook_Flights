import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { rowsOf } from "../../lib/utils";
import { Header } from "../common/Header";

export function AdminDashboard({ session }) {
  const [stats, setStats] = useState([]);
  useEffect(() => {
    Promise.all(["flights", "aircrafts", "schedules", "seats", "bookings", "tickets"].map((r) => api.get(`/${r}`, session)))
      .then((data) => setStats(data.map((items, index) => ({ name: ["Flights", "Aircraft", "Schedules", "Seats", "Bookings", "Tickets"][index], count: rowsOf(items).length }))))
      .catch(() => setStats([]));
  }, [session]);
  return (
    <section>
      <Header title="Operations Dashboard" subtitle="Live counts from the Spring Boot API." />
      <div className="metric-grid">
        {stats.map((item) => (
          <article className="metric" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.count}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
