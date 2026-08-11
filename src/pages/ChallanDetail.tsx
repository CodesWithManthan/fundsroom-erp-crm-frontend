import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getChallanById, confirmChallan, cancelChallan } from "../api/challans";
import type { Challan, ChallanItem } from "../api/challans";

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
      load(); // refresh to show confirmed status
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
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!challan)
    return <p style={{ padding: 20, color: "red" }}>{error || "Not found"}</p>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 600 }}>
      <Link to="/challans">&larr; Back to list</Link>
      <h2>{challan.challan_number}</h2>
      <p>
        <b>Customer:</b> {challan.customer_name}
      </p>
      <p>
        <b>Status:</b> {challan.status}
      </p>
      <p>
        <b>Total Quantity:</b> {challan.total_quantity}
      </p>
      <p>
        <b>Created:</b> {new Date(challan.created_at).toLocaleString()}
      </p>
      {challan.confirmed_at && (
        <p>
          <b>Confirmed:</b> {new Date(challan.confirmed_at).toLocaleString()}
        </p>
      )}

      <h3>Items</h3>
      <table
        border={1}
        cellPadding={6}
        style={{ borderCollapse: "collapse", width: "100%", marginBottom: 16 }}
      >
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Price (at time of sale)</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name_snapshot}</td>
              <td>{item.product_sku_snapshot}</td>
              <td>₹{item.unit_price_snapshot}</td>
              <td>{item.quantity}</td>
              <td>₹{item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {challan.status === "draft" && (
        <div>
          <button onClick={handleConfirm} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Confirm (reduce stock)"}
          </button>{" "}
          <button onClick={handleCancel} disabled={actionLoading}>
            Cancel Challan
          </button>
        </div>
      )}
      {challan.status === "confirmed" && (
        <p style={{ color: "green" }}>✔ Confirmed — stock reduced.</p>
      )}
      {challan.status === "cancelled" && (
        <p style={{ color: "gray" }}>Cancelled — no stock impact.</p>
      )}
    </div>
  );
}
