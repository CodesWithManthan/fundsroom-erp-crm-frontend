import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="navbar-brand">StockLine</span>
        <div className="navbar-links">
          <Link
            to="/customers"
            className={
              location.pathname.startsWith("/customers") ? "active" : ""
            }
          >
            Customers
          </Link>
          <Link
            to="/products"
            className={
              location.pathname.startsWith("/products") ? "active" : ""
            }
          >
            Products
          </Link>
          <Link
            to="/challans"
            className={
              location.pathname.startsWith("/challans") ? "active" : ""
            }
          >
            Challans
          </Link>
        </div>
      </div>
      <div className="navbar-user">
        <div className="avatar-circle">{initials}</div>
        <span>
          {user.name} ({user.role})
        </span>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
