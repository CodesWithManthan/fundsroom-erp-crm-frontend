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
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
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
      setSubmitting(false);
    }
  }

  if (loading) return <p className="state-text">Loading...</p>;

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h2 className="page-title">
          {isEdit ? "Edit Product" : "New Product"}
        </h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Basic Info</div>
          <div className="form-grid">
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
              label="Location"
              value={form.location}
              onChange={(v) => handleChange("location", v)}
            />
          </div>

          <div className="form-section-title">Pricing & Stock</div>
          <div className="form-grid">
            <Field
              label="Unit Price"
              value={String(form.unit_price ?? "")}
              onChange={(v) => handleChange("unit_price", v)}
              type="number"
            />
            <Field
              label="Min Stock Alert"
              value={String(form.min_stock_alert ?? "")}
              onChange={(v) => handleChange("min_stock_alert", v)}
              type="number"
            />
            <div className="form-group">
              <label className="form-label">
                Initial Stock
                {isEdit ? " (use Adjust Stock on detail page)" : ""}
              </label>
              <input
                type="number"
                className="form-input"
                value={form.current_stock ?? 0}
                onChange={(e) => handleChange("current_stock", e.target.value)}
                disabled={isEdit}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Product"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/products")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
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
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
