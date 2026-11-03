
import { auth } from "../firebase";

const API_URL = "http://localhost:5000/api/issues";

async function getAuthHeaders() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in again.");
  }

  const token = await user.getIdToken();

  return {
  Authorization: `Bearer ${token}`
};
}

function formatStatus(status) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getComplaints() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}?limit=100`, {
    headers,
    cache: "no-store"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load complaints");
  }

  return data.issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: formatStatus(issue.status),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    userName: issue.reporter_name || "Student",
userEmail: issue.reporter_email || "",
voteCount: Number(issue.vote_count || 0),
photoUrl: issue.photoUrl || null,
  }));
}

export async function addComplaint(complaint) {
  const headers = await getAuthHeaders();
  const formData = new FormData();

  formData.append("title", complaint.title);
  formData.append("description", complaint.description);
  formData.append("category", "Other");
  formData.append("priority", "MEDIUM");
  formData.append("location", "Not specified");

  if (complaint.photo) {
    formData.append("photo", complaint.photo);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: formData
  });

  

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not submit complaint");
  }

  return data.issue;
}

// Fetch complaints submitted by all students
export async function getCommunityIssues() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/community`, {
    headers,
    cache: "no-store"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load community issues");
  }

  return data.issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: formatStatus(issue.status),
    createdAt: issue.created_at,
    userName: issue.reporter_name || "Student",
    reportedBy: String(issue.reported_by),
    voteCount: Number(issue.vote_count || 0),
    hasVoted: issue.has_voted
  }));
}

// Support another student's complaint
export async function voteForIssue(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/${id}/vote`, {
    method: "POST",
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not record your support");
  }

  return data;
}

export async function updateComplaint(id, updates) {
  const headers = await getAuthHeaders();

  const statusMap = {
    "Pending": "PENDING",
    "In Progress": "IN_PROGRESS",
    "Resolved": "RESOLVED"
  };

  const response = await fetch(`${API_URL}/${id}/status`, {
  method: "PATCH",
  headers: {
    ...headers,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    status: statusMap[updates.status] || updates.status
  })
});

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not update complaint");
  }

  return data.issue;
}
const NOTIFICATIONS_API_URL = "http://localhost:5000/api/notifications";

// Fetch notifications for the logged-in user
export async function getNotifications() {
  const headers = await getAuthHeaders();

  const response = await fetch(NOTIFICATIONS_API_URL, {
    headers,
    cache: "no-store"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load notifications");
  }

  return data.notifications;
}

// Mark a notification as read
export async function markNotificationRead(id) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${NOTIFICATIONS_API_URL}/${id}/read`,
    {
      method: "PATCH",
      headers
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not mark notification as read");
  }

  return data;
}
