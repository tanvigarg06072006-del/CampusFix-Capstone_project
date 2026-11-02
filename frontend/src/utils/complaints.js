
import { auth } from "../firebase";

const API_URL = "http://localhost:5000/api/issues";

async function getAuthHeaders() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in again.");
  }

  const token = await user.getIdToken();

  return {
    "Content-Type": "application/json",
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
voteCount: Number(issue.vote_count || 0)
  }));
}

export async function addComplaint(complaint) {
  const headers = await getAuthHeaders();

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: complaint.title,
      description: complaint.description,
      category: "Other",
      priority: "MEDIUM",
      location: "Not specified"
    })
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
    headers,
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
