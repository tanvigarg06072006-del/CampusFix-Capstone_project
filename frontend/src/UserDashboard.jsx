
import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import {
  getComplaints,
  addComplaint,
  subscribeToComplaints
} from "../utils/complaints";

function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [message, setMessage] = useState("");

  const userEmail = auth.currentUser?.email || "";
  const userName =
    sessionStorage.getItem("campusfixUserName") || "Student";

  useEffect(() => {
    setComplaints(getComplaints());

    const unsubscribe = subscribeToComplaints((updatedComplaints) => {
      setComplaints(updatedComplaints);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!complaintTitle.trim() || !complaintDescription.trim()) {
      setMessage("Please fill in all complaint details.");
      return;
    }

    const newComplaint = {
      id: Date.now(),
      title: complaintTitle.trim(),
      description: complaintDescription.trim(),
      userName: userName,
      userEmail: userEmail,
      status: "Pending",
      isNew: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addComplaint(newComplaint);

    setComplaintTitle("");
    setComplaintDescription("");
    setMessage("Your complaint has been submitted successfully!");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Unable to logout. Please try again.");
    }
  };

  const myComplaints = complaints.filter(
    (complaint) =>
      complaint.userEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>CampusFix</h1>
          <p>Student Dashboard</p>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="dashboard-container">
        <section className="welcome-section">
          <h2>Welcome, {userName}!</h2>
          <p>
            Report your campus problems and track their resolution status.
          </p>
        </section>

        <section className="complaint-form-section">
          <h2>Report a Complaint</h2>

          <form onSubmit={handleSubmit} className="complaint-form">
            <label>Complaint Title</label>

            <input
              type="text"
              placeholder="Enter complaint title"
              value={complaintTitle}
              onChange={(e) => setComplaintTitle(e.target.value)}
              required
            />

            <label>Complaint Description</label>

            <textarea
              placeholder="Describe your problem..."
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              rows="4"
              required
            />

            <button type="submit">
              Submit Complaint
            </button>

            {message && <p>{message}</p>}
          </form>
        </section>

        <section className="my-complaints-section">
          <h2>My Complaints</h2>

          {myComplaints.length === 0 ? (
            <p>You have not submitted any complaints yet.</p>
          ) : (
            <div className="complaints-list">
              {myComplaints.map((complaint) => (
                <div className="complaint-card" key={complaint.id}>
                  <h3>{complaint.title}</h3>

                  <p>{complaint.description}</p>

                  <p>
                    <strong>Status: </strong>
                    <span
                      className={`status-badge ${
                        complaint.status
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </p>

                  <p>
                    <strong>Submitted:</strong>{" "}
                    {formatDate(complaint.createdAt)}
                  </p>

                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {formatDate(complaint.updatedAt)}
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

export default UserDashboard;
