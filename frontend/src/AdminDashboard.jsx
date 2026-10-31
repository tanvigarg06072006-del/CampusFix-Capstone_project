
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getComplaints,
  updateComplaint,
  subscribeToComplaints
} from "./utils/complaints";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState(getComplaints());
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToComplaints(setComplaints);
    return unsubscribe;
  }, []);

  function changeStatus(id, status) {
    updateComplaint(id, {
      status,
      isNew: false,
      updatedAt: new Date().toISOString()
    });
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long"
    });
  }

  const newCount = complaints.filter(c => c.isNew).length;
  const pendingCount = complaints.filter(
    c => c.status === "Pending"
  ).length;
  const progressCount = complaints.filter(
    c => c.status === "In Progress"
  ).length;
  const resolvedCount = complaints.filter(
    c => c.status === "Resolved"
  ).length;

  const filteredComplaints = complaints.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "New" && item.isNew) ||
      item.status === filter;

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.userName.toLowerCase().includes(search.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  function logout() {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>CampusFix</h1>
          <p>Admin Dashboard</p>
        </div>

        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Administrator Panel</h2>
          <p>Manage, monitor and resolve campus complaints.</p>
        </div>

        <section className="admin-stats">
          <div className="stat-card new-stat">
            <span>New Complaints</span>
            <strong>{newCount}</strong>
          </div>

          <div className="stat-card">
            <span>Total Complaints</span>
            <strong>{complaints.length}</strong>
          </div>

          <div className="stat-card pending-stat">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="stat-card progress-stat">
            <span>In Progress</span>
            <strong>{progressCount}</strong>
          </div>

          <div className="stat-card resolved-stat">
            <span>Resolved</span>
            <strong>{resolvedCount}</strong>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Manage Complaints</h3>
              <p>Review and update complaints submitted by students.</p>
            </div>
          </div>

          <div className="complaint-filters">
            <input
              type="text"
              placeholder="Search by complaint or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Complaints</option>
              <option value="New">New Complaints</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="empty-complaints">
              <h3>No complaints found</h3>
              <p>New student complaints will appear here automatically.</p>
            </div>
          ) : (
            <div className="admin-complaint-list">
              {filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  className={`admin-complaint-card ${
                    item.isNew ? "new-complaint" : ""
                  }`}
                >
                  <div className="complaint-top-row">
                    <div>
                      <div className="complaint-title-row">
                        <h3>{item.title}</h3>

                        {item.isNew && (
                          <span className="new-label">NEW</span>
                        )}
                      </div>

                      <p className="complaint-date">
                        Complaint ID: {item.id}
                      </p>
                    </div>

                    <span className={`status-badge ${
                      item.status === "Resolved"
                        ? "resolved"
                        : item.status === "In Progress"
                        ? "in-progress"
                        : "pending"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="complaint-user-details">
                    <p><strong>Submitted by:</strong> {item.userName}</p>
                    <p><strong>Email:</strong> {item.userEmail}</p>
                    <p><strong>Submitted on:</strong> {formatDate(item.createdAt)}</p>
                  </div>

                  <div className="admin-status-control">
                    <label htmlFor={`status-${item.id}`}>
                      Update Complaint Status
                    </label>

                    <select
                      id={`status-${item.id}`}
                      value={item.status}
                      onChange={(e) =>
                        changeStatus(item.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <p className="complaint-date">
                    Last updated: {formatDate(item.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
