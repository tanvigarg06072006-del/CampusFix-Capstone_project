import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./AdminDashboard.jsx";

function ProtectedRoute({ role, children }) {
  const savedRole = sessionStorage.getItem("campusfixRole");

  if (savedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login/:role" element={<Login />} />

      <Route path="/user" element={
        <ProtectedRoute role="user">
          <UserDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
