import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomerById, addCustomerNote } from "../api/customers";
import type { Customer, CustomerNote } from "../api/customers";

const STATUS_BADGE: Record<Customer["status"], string> = {
  lead: "badge-gray",
  active: "badge-green",
  inactive: "badge-red",
};

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getCustomerById(id);
      setCustomer(data.customer);
      setNotes(data.notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    setSubmitting(true);
    try {
      await addCustomerNote(id, newNote);
      setNewNote("");
      await load(); // refresh notes list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="state-text">Loading...</p>;
  if (error) return <p className="state-text form-error">{error}</p>;
  if (!customer) return null;

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <Link to="/customers" className="back-link">
        &larr; Back to Customers
      </Link>

      <div className="detail-header" style={{ marginTop: 12 }}>
        <div className="detail-header-info">
          <h2 className="page-title">{customer.name}</h2>
          <span className={`badge ${STATUS_BADGE[customer.status]}`}>
            {customer.status}
          </span>
        </div>
        <Link to={`/customers/${customer.id}/edit`}>
          <button className="btn btn-secondary">Edit</button>
        </Link>
      </div>

      <div className="card">
        <div className="info-grid">
          <div>
            <div className="info-item-label">Business</div>
            <div className="info-item-value">
              {customer.business_name || "-"}
            </div>
          </div>
          <div>
            <div className="info-item-label">Mobile</div>
            <div className="info-item-value">{customer.mobile}</div>
          </div>
          <div>
            <div className="info-item-label">Email</div>
            <div className="info-item-value">{customer.email || "-"}</div>
          </div>
          <div>
            <div className="info-item-label">Type</div>
            <div className="info-item-value">{customer.customer_type}</div>
          </div>
          <div>
            <div className="info-item-label">GST Number</div>
            <div className="info-item-value">{customer.gst_number || "-"}</div>
          </div>
          <div>
            <div className="info-item-label">Follow-up Date</div>
            <div className="info-item-value">
              {customer.follow_up_date?.slice(0, 10) || "-"}
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="info-item-label">Address</div>
            <div className="info-item-value">{customer.address || "-"}</div>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Notes</h3>
      <form onSubmit={handleAddNote} className="form-group">
        <textarea
          className="form-textarea"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a follow-up note..."
          rows={3}
        />
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Note"}
          </button>
        </div>
      </form>

      {notes.length === 0 && <p className="state-text">No notes yet.</p>}
      {notes.map((n) => (
        <div key={n.id} className="note-item">
          <div>{n.note}</div>
          <small style={{ color: "var(--color-text-muted)" }}>
            {new Date(n.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}
