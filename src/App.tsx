import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function CustomersPlaceholder() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button onClick={logout}>Logout</button>
      <h3>Customers page — coming next</h3>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomersPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
