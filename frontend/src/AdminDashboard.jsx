
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([
    { id: 1, title: "Water leakage in hostel", status: "Pending" },
    { id: 2, title: "Classroom fan not working", status: "In Progress" },
    { id: 3, title: "Library lights not working", status: "Pending" }
  ]);

  function updateStatus(id, status) {
    setComplaints(complaints.map((item) =>
      item.id === id ? { ...item, status } : item
    ));
  }

  return (
    <div className="dashboard">
      <header>
        <h1>CampusFix | Admin Dashboard</h1>
        <button onClick={() => {
          sessionStorage.clear();
          navigate("/");
        }}>Logout</button>
      </header>

      <h2>Administrator Panel</h2>
      <p>Manage and resolve campus complaints.</p>

      <div className="stats">
        <div className="dashboard-card">
          <h3>{complaints.length}</h3>
          <p>Total Complaints</p>
        </div>
        <div className="dashboard-card">
          <h3>{complaints.filter(c => c.status === "Pending").length}</h3>
          <p>Pending</p>
        </div>
        <div className="dashboard-card">
          <h3>{complaints.filter(c => c.status === "Resolved").length}</h3>
          <p>Resolved</p>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Manage Complaints</h3>

        {complaints.map((item) => (
          <div className="complaint-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>Status: {item.status}</p>
            </div>

            <select
              value={item.status}
              onChange={(e) => updateStatus(item.id, e.target.value)}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
