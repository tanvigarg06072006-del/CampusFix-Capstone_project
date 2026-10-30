
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState("");
  const [complaints, setComplaints] = useState([]);

  function submitComplaint(e) {
    e.preventDefault();

    if (!complaint.trim()) return;

    setComplaints([
      ...complaints,
      { id: Date.now(), title: complaint, status: "Submitted" }
    ]);

    setComplaint("");
  }

  return (
    <div className="dashboard">
      <header>
        <h1>CampusFix | User Dashboard</h1>
        <button onClick={() => {
          sessionStorage.clear();
          navigate("/");
        }}>Logout</button>
      </header>

      <h2>Welcome, Student!</h2>
      <p>Report campus problems and track their progress.</p>

      <div className="dashboard-card">
        <h3>Submit a Complaint</h3>
        <form onSubmit={submitComplaint}>
          <input
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Describe your campus problem"
          />
          <button type="submit">Submit Complaint</button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3>My Complaints</h3>
        {complaints.length === 0 && <p>No complaints submitted yet.</p>}

        {complaints.map((item) => (
          <p key={item.id}>
            {item.title} — <strong>{item.status}</strong>
          </p>
        ))}
      </div>
    </div>
  );
}
