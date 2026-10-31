import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import "./App.css";

function Home() {
  return (
    <main className="home-page">
      <h1>CampusFix</h1>
      <p>Your campus, your voice. Let's fix it together.</p>

      <div className="role-options">
        <Link to="/login/admin" className="role-card">
          <span>🛡️</span>
          <h2>Admin</h2>
          <p>Manage and resolve complaints</p>
        </Link>

        <Link to="/login/user" className="role-card">
          <span>👤</span>
          <h2>User</h2>
          <p>Report and track campus issues</p>
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}