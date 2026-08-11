import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../api/customers";
import type { Customer } from "../api/customers";
import { getProducts } from "../api/products";
import type { Product } from "../api/products";
import { createChallan } from "../api/challans";
import type { ChallanItemInput } from "../api/challans";

interface LineItem {
  product_id: string; // string for select binding, converted on submit
  quantity: string;
}

export default function ChallanForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { product_id: "", quantity: "" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => {});
    getProducts()
      .then(setProducts)
      .catch(() => {});
  }, []);

  function updateLine(index: number, field: keyof LineItem, value: string) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { product_id: "", quantity: "" }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function productStock(productId: string) {
    const p = products.find((p) => String(p.id) === productId);
    return p ? p.current_stock : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Select a customer");
      return;
    }

    const items: ChallanItemInput[] = [];
    for (const line of lines) {
      if (!line.product_id || !line.quantity || Number(line.quantity) <= 0) {
        setError("Every line needs a product and a quantity greater than 0");
        return;
      }
      items.push({
        product_id: Number(line.product_id),
        quantity: Number(line.quantity),
      });
    }
    if (items.length === 0) {
      setError("Add at least one product line");
      return;
    }

    setLoading(true);
    try {
      const result = await createChallan(Number(customerId), items);
      navigate(`/challans/${result.challan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create challan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h2 className="page-title">New Challan</h2>
      </div>

      {/* drafts intentionally skip stock validation — stock is only checked/reduced on confirm */}
      <div className="draft-notice">
        Saves as Draft — stock is not affected until confirmed.
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select
              className="form-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">-- Select customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.business_name ? `(${c.business_name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section-title">Products</div>
          {lines.map((line, i) => {
            const stock = productStock(line.product_id);
            return (
              <div key={i} className="line-item-row">
                <select
                  className="form-select"
                  value={line.product_id}
                  onChange={(e) => updateLine(i, "product_id", e.target.value)}
                >
                  <option value="">-- Select product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.unit_price}) — stock: {p.current_stock}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                />
                {stock !== null && Number(line.quantity) > stock && (
                  <span className="line-item-warning">
                    exceeds stock ({stock})
                  </span>
                )}
                {lines.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => removeLine(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
          <button type="button" className="add-line-btn" onClick={addLine}>
            + Add another product
          </button>

          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/challans")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
