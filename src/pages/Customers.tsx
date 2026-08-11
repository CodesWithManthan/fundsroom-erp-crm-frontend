import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomers } from "../api/customers";
import type { Customer } from "../api/customers";

const STATUS_BADGE: Record<Customer["status"], string> = {
  lead: "badge-gray",
  active: "badge-green",
  inactive: "badge-red",
};

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(searchTerm = "") {
    setLoading(true);
    setError("");
    try {
      const data = await getCustomers(searchTerm);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        <Link to="/customers/new">
          <button className="btn btn-primary">+ Add Customer</button>
        </Link>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          className="form-input"
          placeholder="Search by name, business, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260 }}
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {loading && <p className="state-text">Loading...</p>}
      {error && <p className="state-text form-error">{error}</p>}
      {!loading && customers.length === 0 && (
        <p className="state-text">No customers found.</p>
      )}

      {!loading && customers.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="clickable-row"
                onClick={() => navigate(`/customers/${c.id}`)}
              >
                <td>{c.name}</td>
                <td>{c.business_name || "-"}</td>
                <td>{c.mobile}</td>
                <td>{c.customer_type}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
