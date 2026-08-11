import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import type { Product } from "../api/products";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(searchTerm = "") {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts(searchTerm);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
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
        <h2 className="page-title">Products</h2>
        <Link to="/products/new">
          <button className="btn btn-primary">+ Add Product</button>
        </Link>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          className="form-input"
          placeholder="Search by name, SKU, category..."
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
      {!loading && products.length === 0 && (
        <p className="state-text">No products found.</p>
      )}

      {!loading && products.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.current_stock <= p.min_stock_alert;
              return (
                <tr
                  key={p.id}
                  className="clickable-row"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.category || "-"}</td>
                  <td>₹{p.unit_price}</td>
                  <td>
                    {p.current_stock}
                    {low && (
                      <span
                        className="badge badge-yellow"
                        style={{ marginLeft: 6 }}
                      >
                        Low
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
