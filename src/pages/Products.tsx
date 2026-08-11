import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import type { Product } from "../api/products";

export default function Products() {
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
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Products</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 6, width: 260 }}
          />
          <button type="submit">Search</button>
        </form>
        <Link to="/products/new">
          <button>+ Add Product</button>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}

      {!loading && products.length > 0 && (
        <table
          border={1}
          cellPadding={8}
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
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
                  style={low ? { background: "#fff3cd" } : undefined}
                >
                  <td>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{p.sku}</td>
                  <td>{p.category || "-"}</td>
                  <td>₹{p.unit_price}</td>
                  <td>
                    {p.current_stock}
                    {low ? " ⚠ low" : ""}
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
