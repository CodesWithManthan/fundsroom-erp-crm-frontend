import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCustomer,
  updateCustomer,
  getCustomerById,
} from "../api/customers";
import type { Customer } from "../api/customers";

const EMPTY: Partial<Customer> = {
  name: "",
  mobile: "",
  email: "",
  business_name: "",
  gst_number: "",
  customer_type: "retail",
  address: "",
  status: "lead",
  follow_up_date: "",
};

export default function CustomerForm() {
  const { id } = useParams(); // undefined on /customers/new
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Customer>>(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      getCustomerById(id)
        .then(({ customer }) => setForm(customer))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  function handleChange(field: keyof Customer, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateCustomer(id, form);
      } else {
        await createCustomer(form);
      }
      navigate("/customers");
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
          {isEdit ? "Edit Customer" : "New Customer"}
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
              label="Mobile *"
              value={form.mobile}
              onChange={(v) => handleChange("mobile", v)}
              required
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
            />
            <div className="form-group">
              <label className="form-label">Customer Type *</label>
              <select
                className="form-select"
                value={form.customer_type}
                onChange={(e) => handleChange("customer_type", e.target.value)}
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
          </div>

          <div className="form-section-title">Business Details</div>
          <div className="form-grid">
            <Field
              label="Business Name"
              value={form.business_name}
              onChange={(v) => handleChange("business_name", v)}
            />
            <Field
              label="GST Number"
              value={form.gst_number}
              onChange={(v) => handleChange("gst_number", v)}
            />
            <div className="form-group form-grid-full">
              <label className="form-label">Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={form.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>

          <div className="form-section-title">Status</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={
                  form.follow_up_date ? form.follow_up_date.slice(0, 10) : ""
                }
                onChange={(e) => handleChange("follow_up_date", e.target.value)}
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
                  : "Create Customer"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/customers")}
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
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
