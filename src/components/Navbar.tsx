import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <Link to="/customers">Customers</Link>
        <Link to="/products">Products</Link>
      </div>
      <div>
        <span style={{ marginRight: 12 }}>
          {user.name} ({user.role})
        </span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
