import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, updateProduct, getProductById } from "../api/products";
import type { Product } from "../api/products";

const EMPTY: Partial<Product> = {
  name: "",
  sku: "",
  category: "",
  unit_price: 0,
  current_stock: 0,
  min_stock_alert: 0,
  location: "",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Product>>(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      getProductById(id)
        .then(({ product }) => setForm(product))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  function handleChange(field: keyof Product, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        unit_price: Number(form.unit_price),
        current_stock: Number(form.current_stock),
        min_stock_alert: Number(form.min_stock_alert),
      };
      if (isEdit && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480 }}>
      <h2>{isEdit ? "Edit Product" : "New Product"}</h2>
      <form onSubmit={handleSubmit}>
        <Field
          label="Name *"
          value={form.name}
          onChange={(v) => handleChange("name", v)}
          required
        />
        <Field
          label="SKU *"
          value={form.sku}
          onChange={(v) => handleChange("sku", v)}
          required
        />
        <Field
          label="Category"
          value={form.category}
          onChange={(v) => handleChange("category", v)}
        />
        <Field
          label="Unit Price"
          value={String(form.unit_price ?? "")}
          onChange={(v) => handleChange("unit_price", v)}
          type="number"
        />
        <div style={{ marginBottom: 12 }}>
          <label>
            Initial Stock{" "}
            {isEdit ? "(use Adjust Stock on detail page to change)" : ""}
          </label>
          <br />
          <input
            type="number"
            value={form.current_stock ?? 0}
            onChange={(e) => handleChange("current_stock", e.target.value)}
            disabled={isEdit}
            style={{ width: "100%", padding: 6 }}
          />
        </div>
        <Field
          label="Min Stock Alert"
          value={String(form.min_stock_alert ?? "")}
          onChange={(v) => handleChange("min_stock_alert", v)}
          type="number"
        />
        <Field
          label="Location"
          value={form.location}
          onChange={(v) => handleChange("location", v)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">
          {isEdit ? "Save Changes" : "Create Product"}
        </button>{" "}
        <button type="button" onClick={() => navigate("/products")}>
          Cancel
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <br />
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{ width: "100%", padding: 6 }}
      />
    </div>
  );
}
