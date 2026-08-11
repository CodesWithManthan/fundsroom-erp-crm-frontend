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
    try {
      if (isEdit && id) {
        await updateCustomer(id, form);
      } else {
        await createCustomer(form);
      }
      navigate("/customers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480 }}>
      <h2>{isEdit ? "Edit Customer" : "New Customer"}</h2>
      <form onSubmit={handleSubmit}>
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
        <div style={{ marginBottom: 12 }}>
          <label>Customer Type *</label>
          <br />
          <select
            value={form.customer_type}
            onChange={(e) => handleChange("customer_type", e.target.value)}
            style={{ width: "100%", padding: 6 }}
          >
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Status</label>
          <br />
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            style={{ width: "100%", padding: 6 }}
          >
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Field
          label="Address"
          value={form.address}
          onChange={(v) => handleChange("address", v)}
        />
        <div style={{ marginBottom: 12 }}>
          <label>Follow-up Date</label>
          <br />
          <input
            type="date"
            value={form.follow_up_date ? form.follow_up_date.slice(0, 10) : ""}
            onChange={(e) => handleChange("follow_up_date", e.target.value)}
            style={{ padding: 6 }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">
          {isEdit ? "Save Changes" : "Create Customer"}
        </button>{" "}
        <button type="button" onClick={() => navigate("/customers")}>
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
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <br />
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{ width: "100%", padding: 6 }}
      />
    </div>
  );
}
