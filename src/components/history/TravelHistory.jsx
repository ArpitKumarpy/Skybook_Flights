import { useEffect, useState } from "react";
import {
  Plane,
  MapPin,
  History,
  Calendar,
  Navigation,
  Route,
} from "lucide-react";
import { api } from "../../lib/api";

export default function TravelHistory({ session }) {
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [historyData, statisticsData] = await Promise.all([
          api.get(`/travel-history/user/${session.userId}`, session),
          api.get(`/travel-history/statistics/${session.userId}`, session),
        ]);

        setHistory(Array.isArray(historyData) ? historyData : []);
        setStatistics(statisticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session]);

  if (loading) {
    return (
      <div className="travel-loading">
        Loading Travel History...
      </div>
    );
  }

  return (
    <section className="travel-page">
      <div className="travel-header">
        <History size={32} />
        <div>
          <h1>Travel History</h1>
          <p>Your journeys across the world</p>
        </div>
      </div>

      {error && <div className="travel-error">{error}</div>}

      {statistics && (
        <div className="travel-stats">
          <div className="stat-card">
            <Plane size={26} />
            <h2>{statistics.totalFlights || 0}</h2>
            <p>Total Flights</p>
          </div>

          <div className="stat-card">
            <MapPin size={26} />
            <h2>{statistics.favouriteDestination || "-"}</h2>
            <p>Favourite Destination</p>
          </div>

          <div className="stat-card">
            <Navigation size={26} />
            <h2>{statistics.lastDestination || "-"}</h2>
            <p>Last Destination</p>
          </div>

          <div className="stat-card">
            <Route size={26} />
            <h2>{statistics.citiesVisited?.length || 0}</h2>
            <p>Cities Visited</p>
          </div>
        </div>
      )}

      {statistics?.citiesVisited?.length > 0 && (
        <div className="cities-card">
          <h3>Cities Explored</h3>

          <div className="city-tags">
            {statistics.citiesVisited.map((city) => (
              <span key={city} className="city-tag">
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="journey-section">
        <h2>Flight Timeline</h2>

        {history.length === 0 ? (
          <div className="empty-card">
            No travel records found.
          </div>
        ) : (
          history.map((trip, index) => (
            <div className="journey-card" key={index}>
              <div className="journey-top">
                <strong>{trip.flightNumber}</strong>

                <span className={`status ${trip.travelStatus?.toLowerCase()}`}>
                  {trip.travelStatus}
                </span>
              </div>

              <div className="route-line">
                {trip.source} ✈ {trip.destination}
              </div>

              <div className="journey-details">
                <p>
                  <strong>Booking:</strong>{" "}
                  {trip.bookingReference}
                </p>

                <p>
                  <strong>Airline:</strong>{" "}
                  {trip.airlineName}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {trip.departureDate}
                </p>

                <p>
                  <strong>Departure:</strong>{" "}
                  {trip.departureTime}
                </p>

                <p>
                  <strong>Arrival:</strong>{" "}
                  {trip.arrivalTime}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}