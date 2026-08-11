import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomerById, addCustomerNote } from "../api/customers";
import type { Customer, CustomerNote } from "../api/customers";

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    try {
      await addCustomerNote(id, newNote);
      setNewNote("");
      load(); // refresh notes list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!customer) return null;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 500 }}>
      <Link to="/customers">&larr; Back to list</Link>
      <h2>{customer.name}</h2>
      <p>
        <b>Business:</b> {customer.business_name || "-"}
      </p>
      <p>
        <b>Mobile:</b> {customer.mobile}
      </p>
      <p>
        <b>Email:</b> {customer.email || "-"}
      </p>
      <p>
        <b>Type:</b> {customer.customer_type}
      </p>
      <p>
        <b>Status:</b> {customer.status}
      </p>
      <p>
        <b>GST:</b> {customer.gst_number || "-"}
      </p>
      <p>
        <b>Address:</b> {customer.address || "-"}
      </p>
      <p>
        <b>Follow-up date:</b> {customer.follow_up_date?.slice(0, 10) || "-"}
      </p>
      <Link to={`/customers/${customer.id}/edit`}>
        <button>Edit</button>
      </Link>

      <h3 style={{ marginTop: 24 }}>Notes</h3>
      <form onSubmit={handleAddNote} style={{ marginBottom: 16 }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a follow-up note..."
          rows={3}
          style={{ width: "100%", padding: 6 }}
        />
        <button type="submit">Add Note</button>
      </form>

      {notes.length === 0 && <p>No notes yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {notes.map((n) => (
          <li
            key={n.id}
            style={{ borderBottom: "1px solid #ddd", padding: "8px 0" }}
          >
            <div>{n.note}</div>
            <small style={{ color: "#888" }}>
              {new Date(n.created_at).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
