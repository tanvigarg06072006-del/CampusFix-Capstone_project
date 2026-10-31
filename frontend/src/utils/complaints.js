
const STORAGE_KEY = "campusfixComplaints";

export function getComplaints() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveComplaints(complaints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));

  // Notify components in the same browser tab
  window.dispatchEvent(new Event("campusfix-complaints-updated"));
}

export function addComplaint(complaint) {
  const complaints = getComplaints();
  complaints.unshift(complaint);
  saveComplaints(complaints);
}

export function updateComplaint(id, updates) {
  const complaints = getComplaints().map((item) =>
    item.id === id
      ? { ...item, ...updates }
      : item
  );

  saveComplaints(complaints);
}

export function subscribeToComplaints(callback) {
  const handleUpdate = () => callback(getComplaints());

  window.addEventListener("storage", handleUpdate);
  window.addEventListener("campusfix-complaints-updated", handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(
      "campusfix-complaints-updated",
      handleUpdate
    );
  };
}
