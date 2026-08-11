import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getChallans } from "../api/challans";
import type { Challan } from "../api/challans";

const STATUS_BADGE: Record<Challan["status"], string> = {
  draft: "badge-yellow",
  confirmed: "badge-green",
  cancelled: "badge-red",
};

export default function Challans() {
  const navigate = useNavigate();
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

  // counts are computed from whatever's currently loaded, not a separate API call
  const draftCount = challans.filter((c) => c.status === "draft").length;
  const confirmedCount = challans.filter(
    (c) => c.status === "confirmed",
  ).length;
  const cancelledCount = challans.filter(
    (c) => c.status === "cancelled",
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Sales Challans</h2>
        <Link to="/challans/new">
          <button className="btn btn-primary">+ New Challan</button>
        </Link>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <div className="summary-box-label">Total</div>
          <div className="summary-box-value">{challans.length}</div>
        </div>
        <div className="summary-box accent-draft">
          <div className="summary-box-label">Draft</div>
          <div className="summary-box-value">{draftCount}</div>
        </div>
        <div className="summary-box accent-confirmed">
          <div className="summary-box-label">Confirmed</div>
          <div className="summary-box-value">{confirmedCount}</div>
        </div>
        <div className="summary-box accent-cancelled">
          <div className="summary-box-label">Cancelled</div>
          <div className="summary-box-value">{cancelledCount}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p className="state-text">Loading...</p>}
      {error && <p className="state-text form-error">{error}</p>}
      {!loading && challans.length === 0 && (
        <p className="state-text">No challans found.</p>
      )}

      {!loading && challans.length > 0 && (
        <table className="table">
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
              <tr
                key={c.id}
                className="clickable-row"
                onClick={() => navigate(`/challans/${c.id}`)}
              >
                <td>{c.challan_number}</td>
                <td>{c.customer_name}</td>
                <td>{c.total_quantity}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
