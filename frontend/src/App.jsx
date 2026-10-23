
import { useState } from "react";
import "./App.css";

const initialIssues = [
  {
    id: 101,
    title: "Projector not working",
    category: "Classroom Equipment",
    location: "Block A, Room 101",
    priority: "High",
    status: "In Progress",
    date: "23 Oct 2026",
  },
  {
    id: 102,
    title: "Water leakage near washroom",
    category: "Plumbing",
    location: "Block B, Ground Floor",
    priority: "Urgent",
    status: "Open",
    date: "23 Oct 2026",
  },
  {
    id: 103,
    title: "Broken chair in library",
    category: "Furniture",
    location: "Central Library",
    priority: "Low",
    status: "Resolved",
    date: "22 Oct 2026",
  },
];

function App() {
  const [issues, setIssues] = useState(initialIssues);
  const [page, setPage] = useState("Home");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Classroom Equipment",
    location: "",
    priority: "Medium",
    description: "",
  });

  const openCount = issues.filter((i) => i.status === "Open").length;
  const progressCount = issues.filter(
    (i) => i.status === "In Progress"
  ).length;
  const resolvedCount = issues.filter(
    (i) => i.status === "Resolved"
  ).length;

  const filteredIssues = issues.filter((issue) => {
    const query = search.toLowerCase();

    const matchesSearch = [
      issue.title,
      issue.category,
      issue.location,
    ].some((value) => value.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "All" || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function navigate(nextPage) {
    setPage(nextPage);
    setSelected(null);
    setMessage("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submitIssue(event) {
    event.preventDefault();

    const newIssue = {
      id: Date.now(),
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      priority: form.priority,
      status: "Open",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      description: form.description.trim(),
    };

    setIssues((current) => [newIssue, ...current]);
    setForm({
      title: "",
      category: "Classroom Equipment",
      location: "",
      priority: "Medium",
      description: "",
    });
    setPage("Issues");
    setSelected(null);
    setMessage("Issue added to the demo successfully.");
  }

  return (
    <div className="site">
      <header className="header">
        <button className="logo" onClick={() => navigate("Home")}>
          <span className="logo-mark">CF</span>
          <span>CampusFix</span>
        </button>

        <nav className="navigation" aria-label="Main navigation">
          <button
            className={page === "Home" ? "nav-link current" : "nav-link"}
            onClick={() => navigate("Home")}
          >
            Home
          </button>
          <button
            className={page === "Issues" ? "nav-link current" : "nav-link"}
            onClick={() => navigate("Issues")}
          >
            Reported issues
          </button>
        </nav>

        <button
          className="primary-button header-button"
          onClick={() => navigate("Report")}
        >
          + Report an issue
        </button>
      </header>

      <main className="container">
        {message && (
          <div className="message" role="status">
            {message}
            <button onClick={() => setMessage("")} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        {selected ? (
          <section className="content-section">
            <button className="back-link" onClick={() => setSelected(null)}>
              ← Back to issues
            </button>

            <div className="detail-heading">
              <div>
                <p className="muted-label">ISSUE #{selected.id}</p>
                <h1>{selected.title}</h1>
                <p className="subheading">
                  Reported on {selected.date}
                </p>
              </div>
              <Status status={selected.status} />
            </div>

            <div className="panel detail-panel">
              <h2>Issue details</h2>
              <dl className="detail-list">
                <div>
                  <dt>Category</dt>
                  <dd>{selected.category}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{selected.location}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{selected.priority}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd><Status status={selected.status} /></dd>
                </div>
              </dl>
              <div className="description">
                <h3>Description</h3>
                <p>{selected.description || "No description provided."}</p>
              </div>
              <p className="demo-note">
                This is demo data. Live issue details and comments will be
                connected to the backend next.
              </p>
            </div>
          </section>
        ) : page === "Report" ? (
          <section className="content-section narrow">
            <button className="back-link" onClick={() => navigate("Home")}>
              ← Back to home
            </button>

            <p className="muted-label">CAMPUS MAINTENANCE</p>
            <h1>Report an issue</h1>
            <p className="subheading">
              Let the campus team know what needs fixing.
            </p>

            <form className="panel form-panel" onSubmit={submitIssue}>
              <label>
                Issue title <span className="required">*</span>
                <input
                  name="title"
                  required
                  minLength={4}
                  maxLength={150}
                  value={form.title}
                  onChange={updateField}
                  placeholder="e.g. Fan not working in Room 202"
                />
              </label>

              <label>
                Description <span className="required">*</span>
                <textarea
                  name="description"
                  required
                  minLength={10}
                  rows={4}
                  value={form.description}
                  onChange={updateField}
                  placeholder="Describe the problem..."
                />
              </label>

              <div className="field-row">
                <label>
                  Category
                  <select name="category" value={form.category} onChange={updateField}>
                    <option>Classroom Equipment</option>
                    <option>Electrical</option>
                    <option>Plumbing</option>
                    <option>Cleanliness</option>
                    <option>Furniture</option>
                    <option>Internet</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select name="priority" value={form.priority} onChange={updateField}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </label>
              </div>

              <label>
                Campus location <span className="required">*</span>
                <input
                  name="location"
                  required
                  value={form.location}
                  onChange={updateField}
                  placeholder="Building, block or room number"
                />
              </label>

              <p className="form-help">
                Please provide enough detail for the maintenance team to locate
                the problem.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("Home")}
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Submit report
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="content-section">
            <div className="welcome">
              <div>
                <p className="muted-label">CAMPUS SERVICES</p>
                <h1>{page === "Home" ? "Campus maintenance" : "Reported issues"}</h1>
                <p className="subheading">
                  Report problems and follow their progress in one place.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => navigate("Report")}
              >
                + Report an issue
              </button>
            </div>

            {page === "Home" && (
              <div className="summary-grid">
                <Summary label="Total issues" count={issues.length} />
                <Summary label="Open" count={openCount} />
                <Summary label="In progress" count={progressCount} />
                <Summary label="Resolved" count={resolvedCount} />
              </div>
            )}

            <div className="section-title">
              <div>
                <h2>{page === "Home" ? "Recent issues" : "All reported issues"}</h2>
                <p>View the latest maintenance reports from campus.</p>
              </div>
              {page === "Home" && (
                <button className="text-button" onClick={() => navigate("Issues")}>
                  View all
                </button>
              )}
            </div>

            <div className="panel issue-panel">
              <div className="filters">
                <input
                  className="search-input"
                  aria-label="Search issues"
                  placeholder="Search issues or locations..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="empty-state">
                  <h3>No issues found</h3>
                  <p>Try another search or report a new problem.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Issue</th>
                        <th>Location</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Reported</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(page === "Home" ? filteredIssues.slice(0, 5) : filteredIssues).map(
                        (issue) => (
                          <tr key={issue.id}>
                            <td>
                              <button
                                className="issue-title"
                                onClick={() => setSelected(issue)}
                              >
                                {issue.title}
                              </button>
                              <span className="table-subtext">{issue.category}</span>
                            </td>
                            <td>{issue.location}</td>
                            <td>
                              <span className={`priority priority-${issue.priority.toLowerCase()}`}>
                                {issue.priority}
                              </span>
                            </td>
                            <td><Status status={issue.status} /></td>
                            <td>{issue.date}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="table-footer">
                {filteredIssues.length} issue{filteredIssues.length === 1 ? "" : "s"}
              </div>
            </div>

            {page === "Home" && (
              <div className="help-box">
                <div>
                  <h3>Need to report a campus problem?</h3>
                  <p>Submit the details and help your campus team take action.</p>
                </div>
                <button className="secondary-button" onClick={() => navigate("Report")}>
                  Create a report
                </button>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <span>CampusFix</span>
          <span>Campus issue reporting system</span>
        </footer>
      </main>
    </div>
  );
}

function Summary({ label, count }) {
  return (
    <div className="summary-card">
      <span>{label}</span>
      <strong>{count}</strong>
    </div>
  );
}

function Status({ status }) {
  const className = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${className}`}>{status}</span>;
}

export default App;
