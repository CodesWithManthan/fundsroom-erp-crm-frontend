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
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 600 }}>
      <h2>New Challan</h2>
      <p style={{ color: "#666" }}>
        Saves as Draft — stock is not affected until confirmed.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Customer *</label>
          <br />
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ width: "100%", padding: 6 }}
          >
            <option value="">-- Select customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.business_name ? `(${c.business_name})` : ""}
              </option>
            ))}
          </select>
        </div>

        <h4>Products</h4>
        {lines.map((line, i) => {
          const stock = productStock(line.product_id);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <select
                value={line.product_id}
                onChange={(e) => updateLine(i, "product_id", e.target.value)}
                style={{ flex: 2, padding: 6 }}
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
                placeholder="Qty"
                value={line.quantity}
                onChange={(e) => updateLine(i, "quantity", e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />
              {stock !== null && Number(line.quantity) > stock && (
                <span style={{ color: "orange", fontSize: 12 }}>
                  exceeds current stock ({stock})
                </span>
              )}
              {lines.length > 1 && (
                <button type="button" onClick={() => removeLine(i)}>
                  Remove
                </button>
              )}
            </div>
          );
        })}
        <button type="button" onClick={addLine} style={{ marginBottom: 16 }}>
          + Add another product
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save as Draft"}
          </button>{" "}
          <button type="button" onClick={() => navigate("/challans")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
