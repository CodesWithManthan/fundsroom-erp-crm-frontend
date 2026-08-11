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
      load(); // refresh product + movement log
    } catch (err) {
      // this is where "Insufficient stock for this adjustment" (409) surfaces
      setError(err instanceof Error ? err.message : "Adjustment failed");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!product)
    return <p style={{ padding: 20, color: "red" }}>{error || "Not found"}</p>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 520 }}>
      <Link to="/products">&larr; Back to list</Link>
      <h2>{product.name}</h2>
      <p>
        <b>SKU:</b> {product.sku}
      </p>
      <p>
        <b>Category:</b> {product.category || "-"}
      </p>
      <p>
        <b>Unit Price:</b> ₹{product.unit_price}
      </p>
      <p>
        <b>Current Stock:</b> {product.current_stock}
      </p>
      <p>
        <b>Min Stock Alert:</b> {product.min_stock_alert}
      </p>
      <p>
        <b>Location:</b> {product.location || "-"}
      </p>
      <Link to={`/products/${product.id}/edit`}>
        <button>Edit</button>
      </Link>

      <h3 style={{ marginTop: 24 }}>Adjust Stock</h3>
      <form onSubmit={handleAdjust} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "IN" | "OUT")}
          >
            <option value="IN">IN (add stock)</option>
            <option value="OUT">OUT (remove stock)</option>
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{ padding: 6, width: 100 }}
          />
        </div>
        <input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ padding: 6, width: "100%", marginBottom: 8 }}
        />
        <button type="submit">Apply</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </form>

      <h3>Stock Movement Log</h3>
      {movements.length === 0 && <p>No movements yet.</p>}
      <table
        border={1}
        cellPadding={6}
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
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
              <td>{m.movement_type}</td>
              <td>{m.quantity_changed}</td>
              <td>{m.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
