import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { rowsOf } from "../../lib/utils";
import { Header } from "../common/Header";
import { DataTable } from "../common/DataTable";

export function PaymentHistory({ session }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/payments/history", session).then((data) => setRows(rowsOf(data))).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <Header title="Payment History" subtitle="All payments made against your bookings." />
      {error && <div className="error">{error}</div>}
      <DataTable rows={rows} />
    </section>
  );
}
