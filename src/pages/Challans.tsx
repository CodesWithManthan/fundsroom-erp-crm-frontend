import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChallans } from "../api/challans";
import type { Challan } from "../api/challans";

const STATUS_COLORS: Record<string, string> = {
  draft: "#fff3cd",
  confirmed: "#d4edda",
  cancelled: "#f8d7da",
};

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(status = "") {
    setLoading(true);
    setError("");
    try {
      const data = await getChallans(status);
      setChallans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load challans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleFilterChange(value: string) {
    setStatusFilter(value);
    load(value);
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Sales Challans</h2>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Link to="/challans/new">
          <button>+ New Challan</button>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && challans.length === 0 && <p>No challans found.</p>}

      {!loading && challans.length > 0 && (
        <table
          border={1}
          cellPadding={8}
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((c) => (
              <tr key={c.id} style={{ background: STATUS_COLORS[c.status] }}>
                <td>
                  <Link to={`/challans/${c.id}`}>{c.challan_number}</Link>
                </td>
                <td>{c.customer_name}</td>
                <td>{c.total_quantity}</td>
                <td>{c.status}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
