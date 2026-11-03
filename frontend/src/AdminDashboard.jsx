
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getComplaints,
  updateComplaint,
  getNotifications,
  markNotificationRead
} from "./utils/complaints";
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  useEffect(() => {
  let isMounted = true;

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();

      if (isMounted) {
        setComplaints(data);
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  };

  loadComplaints();

  // Automatically check for new complaints every 5 seconds
  const intervalId = setInterval(loadComplaints, 5000);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, []);

  // Fetch notifications every 5 seconds
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getNotifications();

        if (isMounted) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();

    const intervalId = setInterval(loadNotifications, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  async function changeStatus(id, status) {
    try {
      await updateComplaint(id, { status });

      const data = await getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not update complaint status.");
    }
  }
  async function handleNotificationRead(id) {
  try {
    await markNotificationRead(id);

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  } catch (error) {
    console.error("Could not mark notification as read:", error);
  }
}
  

  function formatDate(dateString) {
    if (!dateString) return "Not available";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long"
    });
  }

  const newCount = complaints.filter(
  (complaint) => complaint.status === "Pending"
).length;

  const pendingCount = complaints.filter(
    c => c.status === "Pending"
  ).length;

  const progressCount = complaints.filter(
    c => c.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    c => c.status === "Resolved"
  ).length;

  const unreadCount = notifications.filter(
  (notification) => !notification.is_read
).length;

  const filteredComplaints = complaints.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "New" && item.status === "Pending") ||
      item.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchText) ||
      (item.userName || "").toLowerCase().includes(searchText) ||
      (item.userEmail || "").toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  async function logout() {
    try {
      await signOut(auth);
      sessionStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
        <section className="dashboard-panel">
  <div className="panel-heading">
    <div>
      <h3>Notifications ({unreadCount} unread)</h3>
      <p>Updates about new campus complaints.</p>
    </div>
  </div>

  {notifications.filter((notification) => !notification.is_read).length === 0 ? (
  <p>No unread notifications.</p>
  ) : (
    notifications
  .filter((notification) => !notification.is_read)
  .map((notification) => (
      <div
        key={notification.id}
        className="admin-complaint-card"
      >
        <h4>{notification.title || "Notification"}</h4>
        <p>{notification.message}</p>

        <p className="complaint-date">
          {new Date(notification.created_at).toLocaleString("en-IN")}
        </p>

        {!notification.is_read ? (
          <button
            onClick={() => handleNotificationRead(notification.id)}
          >
            Mark as read
          </button>
        ) : (
          <span>Read</span>
        )}
      </div>
    ))
  )}
</section>

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
  item.status === "Pending" ? "new-complaint" : ""
}`}
                >
                  <div className="complaint-top-row">
                    <div>
                      <div className="complaint-title-row">
                        <h3>{item.title}</h3>

                        {item.status === "Pending" && (
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

  <p>
    <strong>Community Support:</strong>{" "}
    {item.voteCount || 0}{" "}
    {(item.voteCount || 0) === 1 ? "student is" : "students are"} facing this too
  </p>
</div>

{item.photoUrl && (
  <div className="complaint-photo">
    <button
      type="button"
      onClick={() => {
        setExpandedPhoto(
          expandedPhoto === item.id ? null : item.id
        );
      }}
    >
      {expandedPhoto === item.id ? "Hide Photo" : "View Photo"}
    </button>

    {expandedPhoto === item.id && (
      <div style={{ marginTop: "12px" }}>
        <img
          src={item.photoUrl}
          alt="Student's complaint"
          style={{
            width: "100%",
            maxWidth: "350px",
            maxHeight: "300px",
            objectFit: "contain",
            borderRadius: "8px"
          }}
        />
      </div>
    )}
  </div>
)}

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
