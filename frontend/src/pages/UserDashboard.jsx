
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getComplaints,
  addComplaint,
  subscribeToComplaints
} from "../utils/complaints";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState("");
  const [complaints, setComplaints] = useState(getComplaints());
  const [message, setMessage] = useState("");

  const userEmail = sessionStorage.getItem("campusfixUserEmail");
  const userName = sessionStorage.getItem("campusfixUserName");

  useEffect(() => {
    const unsubscribe = subscribeToComplaints(setComplaints);
    return unsubscribe;
  }, []);

  const myComplaints = complaints.filter(
    (item) => item.userEmail === userEmail
  );

  function submitComplaint(e) {
    e.preventDefault();

    if (!complaint.trim()) {
      setMessage("Please describe your complaint.");
      return;
    }

    const newComplaint = {
      id: crypto.randomUUID(),
      title: complaint.trim(),
      description: complaint.trim(),
      userName: userName || "Student",
      userEmail: userEmail,
      status: "Pending",
      isNew: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addComplaint(newComplaint);

    setComplaint("");
    setMessage("Your complaint has been submitted successfully!");
  }

  function logout() {
    sessionStorage.clear();
    navigate("/");
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long"
    });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>CampusFix</h1>
          <p>User Dashboard</p>
        </div>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {userName}!</h2>
          <p>Report campus problems and track their progress.</p>
        </div>

        <section className="dashboard-panel">
          <h3>Submit a Complaint</h3>

          <form onSubmit={submitComplaint}>
            <textarea
              value={complaint}
              onChange={(e) => {
                setComplaint(e.target.value);
                setMessage("");
              }}
              placeholder="Describe your campus problem..."
              rows="4"
              required
            />

            <button type="submit" className="primary-action">
              Submit Complaint
            </button>
          </form>

          {message && (
            <p className="success-message">{message}</p>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <h3>My Complaints</h3>
            <span>{myComplaints.length} Total</span>
          </div>

          {myComplaints.length === 0 ? (
            <div className="empty-complaints">
              <h3>No complaints yet</h3>
              <p>Your submitted complaints will appear here.</p>
            </div>
          ) : (
            myComplaints.map((item) => (
              <div className="user-complaint-card" key={item.id}>
                <div className="complaint-title-row">
                  <h4>{item.title}</h4>
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

                <p className="complaint-date">
                  Submitted: {formatDate(item.createdAt)}
                </p>

                <p className="complaint-date">
                  Last updated: {formatDate(item.updatedAt)}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
