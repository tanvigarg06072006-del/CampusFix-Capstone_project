import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  getComplaints,
  addComplaint,
  getCommunityIssues,
  voteForIssue,
  getNotifications,
  markNotificationRead
} from "../utils/complaints";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState("");
  const [photo, setPhoto] = useState(null);
const [photoPreview, setPhotoPreview] = useState(null);
const photoInputRef = useRef(null);
  const [complaints, setComplaints] = useState([]);
  const [communityIssues, setCommunityIssues] = useState([]);
  const [message, setMessage] = useState("");
  const [communityMessage, setCommunityMessage] = useState("");
  const [votingId, setVotingId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const userName = sessionStorage.getItem("campusfixUserName");
  const unreadCount = notifications.filter(
  (notification) => !notification.is_read
).length;

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [myData, communityData] = await Promise.all([
          getComplaints(),
          getCommunityIssues()
        ]);

        setComplaints(myData);
        setCommunityIssues(communityData);
      } catch (error) {
        console.error(error);
        setMessage(error.message);
      }
    }

    loadDashboard();
  }, []);

  // Fetch student notifications every 5 seconds
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

  useEffect(() => {
  if (!photoPreview) return;

  return () => URL.revokeObjectURL(photoPreview);
}, [photoPreview]);
const myComplaints = complaints;

  // Identify complaints submitted by the current student
  const myComplaintIds = new Set(
    myComplaints.map((item) => String(item.id))
  );

  function handlePhotoChange(e) {
  const selectedFile = e.target.files?.[0];

  if (!selectedFile) {
    setPhoto(null);
    setPhotoPreview(null);
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(selectedFile.type)) {
    setMessage("Please select a JPG, PNG or WEBP image.");
    e.target.value = "";
    return;
  }

  if (selectedFile.size > 5 * 1024 * 1024) {
    setMessage("Image size must be less than 5 MB.");
    e.target.value = "";
    return;
  }

  setPhoto(selectedFile);
  setPhotoPreview(URL.createObjectURL(selectedFile));
  setMessage("");
}
async function submitComplaint(e) {
    e.preventDefault();

    if (!complaint.trim()) {
      setMessage("Please enter a complaint.");
      return;
    }

    try {
      await addComplaint({
  title: complaint.trim().slice(0, 100),
  description: complaint.trim(),
  photo: photo
});

      const [myData, communityData] = await Promise.all([
        getComplaints(),
        getCommunityIssues()
      ]);

      setComplaints(myData);
      setCommunityIssues(communityData);

      setComplaint("");
      setPhoto(null);
setPhotoPreview(null);

if (photoInputRef.current) {
  photoInputRef.current.value = "";
}
      setMessage("Your complaint has been submitted successfully!");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Could not submit complaint.");
    }
  }

 async function handleVote(issueId) {
  try {
    setVotingId(issueId);
    setCommunityMessage("");

    const result = await voteForIssue(issueId);

    setCommunityIssues((previous) =>
      previous.map((issue) =>
        String(issue.id) === String(issueId)
          ? {
              ...issue,
              voteCount: Number(result.vote_count),
              hasVoted: true
            }
          : issue
      )
    );

    setCommunityMessage("Your support has been recorded!");
  } catch (error) {
    console.error(error);
    setCommunityMessage(error.message || "Could not record your support.");
  } finally {
    setVotingId(null);
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
  <div className="panel-heading">
    <h3>Notifications ({unreadCount} unread)</h3>
  </div>

  {notifications.length === 0 ? (
    <p>No notifications yet.</p>
  ) : (
    notifications
  .filter((notification) => !notification.is_read)
  .map((notification) => (
      <div className="user-complaint-card" key={notification.id}>
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

                        <label htmlFor="complaint-photo">
              Attach a photo (optional)
            </label>

            <input
              ref={photoInputRef}
              id="complaint-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />

            {photoPreview && (
              <div>
                <p>Photo preview:</p>
                <img
                  src={photoPreview}
                  alt="Complaint preview"
                  style={{
                    width: "200px",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    if (photoInputRef.current) {
                      photoInputRef.current.value = "";
                    }
                  }}
                >
                  Remove Photo
                </button>
              </div>
            )}

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

        {/* Community Issues Section */}
        <section className="dashboard-panel">
          <div className="panel-heading">
            <h3>Community Issues</h3>
            <span>{communityIssues.length} Open Issues</span>
          </div>

          <p>
            Facing the same problem as another student?
            Support their complaint to let the administration know.
          </p>

          {communityMessage && (
            <p className="success-message">{communityMessage}</p>
          )}

          {communityIssues.length === 0 ? (
            <div className="empty-complaints">
              <h3>No community issues available</h3>
              <p>New open complaints from students will appear here.</p>
            </div>
          ) : (
            communityIssues.map((item) => {
              const isMine = myComplaintIds.has(String(item.id));

              return (
                <div className="user-complaint-card" key={item.id}>
                  <div className="complaint-title-row">
                    <h4>{item.title}</h4>

                    <span className={`status-badge ${
                      item.status === "In Progress"
                        ? "in-progress"
                        : "pending"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p>{item.description}</p>

                  <p className="complaint-date">
                    Reported by: {item.userName}
                  </p>

                  <p className="complaint-date">
                    {item.voteCount} students facing this too
                  </p>

                  <button
                    type="button"
                    className="primary-action"
                    disabled={isMine || item.hasVoted || votingId === item.id}
                    onClick={() => handleVote(item.id)}
                  >
                    {isMine
                      ? "Your Complaint"
                      : item.hasVoted
                      ? "✓ You're Supporting This"
                      : votingId === item.id
                      ? "Recording Support..."
                      : "I'm Facing This Too"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
