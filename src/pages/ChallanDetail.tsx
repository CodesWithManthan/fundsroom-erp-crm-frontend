import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getChallanById, confirmChallan, cancelChallan } from "../api/challans";
import type { Challan, ChallanItem } from "../api/challans";

const STATUS_BADGE: Record<Challan["status"], string> = {
  draft: "badge-yellow",
  confirmed: "badge-green",
  cancelled: "badge-red",
};

export default function ChallanDetail() {
  const { id } = useParams();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getChallanById(id);
      setChallan(data.challan);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleConfirm() {
    if (!id) return;
    setError("");
    setActionLoading(true);
    try {
      await confirmChallan(id);
      await load(); // refresh to show confirmed status
    } catch (err) {
      // insufficient stock (409) or double-confirm (409) both surface here
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    setError("");
    setActionLoading(true);
    try {
      await cancelChallan(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  }
  async function handleDownloadPdf() {
    if (!challan) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5000/challans/${challan.id}/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${challan.challan_number}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading) return <p className="state-text">Loading...</p>;
  if (!challan)
    return <p className="state-text form-error">{error || "Not found"}</p>;

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <Link to="/challans" className="back-link">
        &larr; Back to Challans
      </Link>

      <div className="detail-header" style={{ marginTop: 12 }}>
        <div className="detail-header-info">
          <h2 className="page-title">{challan.challan_number}</h2>
          <span className={`badge ${STATUS_BADGE[challan.status]}`}>
            {challan.status}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={handleDownloadPdf}>
          Download PDF
        </button>
      </div>

      <div className="card">
        <div className="info-grid">
          <div>
            <div className="info-item-label">Customer</div>
            <div className="info-item-value">{challan.customer_name}</div>
          </div>
          <div>
            <div className="info-item-label">Total Quantity</div>
            <div className="info-item-value">{challan.total_quantity}</div>
          </div>
          <div>
            <div className="info-item-label">Created</div>
            <div className="info-item-value">
              {new Date(challan.created_at).toLocaleString()}
            </div>
          </div>
          {challan.confirmed_at && (
            <div>
              <div className="info-item-label">Confirmed</div>
              <div className="info-item-value">
                {new Date(challan.confirmed_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Items</h3>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th className="num">Price (at sale)</th>
            <th className="num">Qty</th>
            <th className="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name_snapshot}</td>
              <td>{item.product_sku_snapshot}</td>
              <td className="num">₹{item.unit_price_snapshot}</td>
              <td className="num">{item.quantity}</td>
              <td className="num">₹{item.subtotal}</td>
            </tr>
          ))}
          <tr className="invoice-total-row">
            <td colSpan={4}>Total</td>
            <td className="num">₹{total}</td>
          </tr>
        </tbody>
      </table>

      {error && <p className="form-error">{error}</p>}

      {challan.status === "draft" && (
        <div className="action-panel">
          <span className="action-panel-text">
            This challan is a draft. Confirming will reduce stock.
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel Challan
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Confirm & Reduce Stock"}
            </button>
          </div>
        </div>
      )}
      {challan.status === "confirmed" && (
        <div className="status-banner confirmed">
          ✔ Confirmed — stock has been reduced.
        </div>
      )}
      {challan.status === "cancelled" && (
        <div className="status-banner cancelled">
          Cancelled — no stock impact.
        </div>
      )}
    </div>
  );
}
