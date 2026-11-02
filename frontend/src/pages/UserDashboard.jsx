
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getComplaints,
  addComplaint
} from "../utils/complaints";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const userName = sessionStorage.getItem("campusfixUserName");

  useEffect(() => {
    async function loadComplaints() {
      try {
        const data = await getComplaints();
        setComplaints(data);
      } catch (error) {
        console.error(error);
        setMessage(error.message);
      }
    }

    loadComplaints();
  }, []);

  const myComplaints = complaints;

  async function submitComplaint(e) {
    e.preventDefault();

    if (!complaint.trim()) {
      setMessage("Please enter a complaint.");
      return;
    }

    try {
      await addComplaint({
        title: complaint.trim().slice(0, 100),
        description: complaint.trim()
      });

      const data = await getComplaints();
      setComplaints(data);

      setComplaint("");
      setMessage("Your complaint has been submitted successfully!");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Could not submit complaint.");
    }
  }

  function logout() {
    sessionStorage.clear();
    navigate("/");
  }

  function formatDate(dateString) {
    if (!dateString) return "Not available";

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

