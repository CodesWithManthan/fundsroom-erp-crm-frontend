import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, adjustStock } from "../api/products";
import type { Product, StockMovement } from "../api/products";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [qty, setQty] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data.product);
      setMovements(data.movements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!id || !qty || Number(qty) <= 0) {
      setError("Enter a valid quantity");
      return;
    }
    setSubmitting(true);
    try {
      const result = await adjustStock(
        id,
        Number(qty),
        type,
        reason || "Manual adjustment",
      );
      setSuccess(`Stock updated. New stock: ${result.current_stock}`);
      setQty("");
      setReason("");
      await load(); // refresh product + movement log
    } catch (err) {
      // this is where "Insufficient stock for this adjustment" (409) surfaces
      setError(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="state-text">Loading...</p>;
  if (!product)
    return <p className="state-text form-error">{error || "Not found"}</p>;

  const lowStock = product.current_stock <= product.min_stock_alert;

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <Link to="/products" className="back-link">
        &larr; Back to Products
      </Link>

      <div className="detail-header" style={{ marginTop: 12 }}>
        <div className="detail-header-info">
          <h2 className="page-title">{product.name}</h2>
          {lowStock && <span className="badge badge-yellow">Low stock</span>}
        </div>
        <Link to={`/products/${product.id}/edit`}>
          <button className="btn btn-secondary">Edit</button>
        </Link>
      </div>

      <div className="card">
        <div className="info-grid">
          <div>
            <div className="info-item-label">SKU</div>
            <div className="info-item-value">{product.sku}</div>
          </div>
          <div>
            <div className="info-item-label">Category</div>
            <div className="info-item-value">{product.category || "-"}</div>
          </div>
          <div>
            <div className="info-item-label">Unit Price</div>
            <div className="info-item-value">₹{product.unit_price}</div>
          </div>
          <div>
            <div className="info-item-label">Current Stock</div>
            <div className="info-item-value">{product.current_stock}</div>
          </div>
          <div>
            <div className="info-item-label">Min Stock Alert</div>
            <div className="info-item-value">{product.min_stock_alert}</div>
          </div>
          <div>
            <div className="info-item-label">Location</div>
            <div className="info-item-value">{product.location || "-"}</div>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Adjust Stock</h3>
      <div className="card">
        <form onSubmit={handleAdjust}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as "IN" | "OUT")}
              >
                <option value="IN">IN (add stock)</option>
                <option value="OUT">OUT (remove stock)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="Quantity"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="form-group form-grid-full">
              <label className="form-label">Reason (optional)</label>
              <input
                className="form-input"
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          {success && (
            <p style={{ color: "var(--color-primary)", fontSize: 13 }}>
              {success}
            </p>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Applying..." : "Apply"}
            </button>
          </div>
        </form>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Stock Movement Log</h3>
      {movements.length === 0 && (
        <p className="state-text">No movements yet.</p>
      )}
      {movements.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.created_at).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${m.movement_type === "IN" ? "badge-green" : "badge-red"}`}
                  >
                    {m.movement_type}
                  </span>
                </td>
                <td>{m.quantity_changed}</td>
                <td>{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
