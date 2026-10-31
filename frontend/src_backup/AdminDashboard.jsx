import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("campusfix_user") || "null");

  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== "admin") {
      navigate("/login/admin");
      return;
    }

    apiRequest("/issues")
      .then((data) => setIssues(data.issues || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("campusfix_token");
    localStorage.removeItem("campusfix_user");
    navigate("/");
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>CampusFix Admin</h1>
          <p>Manage campus complaints</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="admin-content">
        <h2>All Complaints</h2>

        {loading && <p>Loading complaints...</p>}
        {error && <p className="login-error">{error}</p>}

        {!loading && !error && issues.length === 0 && (
          <p>No complaints have been submitted yet.</p>
        )}

        {issues.map((issue) => (
          <article className="complaint-card" key={issue.id}>
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>
            <p><strong>Complaint ID:</strong> {issue.id}</p>
            <p><strong>Reported by:</strong> {issue.reporter_name || issue.reported_by_name || "User"}</p>
            <p><strong>Reported on:</strong> {issue.created_at ? new Date(issue.created_at).toLocaleString() : "Not available"}</p>
            <p><strong>Status:</strong> {issue.status || "Pending"}</p>
          </article>
        ))}
      </section>
    </main>
  );
}