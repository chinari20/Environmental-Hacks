
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Droplets,
  Plus,
  Search,
  MapPin,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Waves,
  ArrowUpRight,
  Filter,
  Leaf,
  ShieldCheck,
  X,
  Gauge
} from "lucide-react";
import "./styles.css";

const API_URL = "http://localhost:5000/api/reports";

const TYPES = [
  "Water leak",
  "Waterlogging",
  "Water shortage",
  "Flooding"
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const STATUSES = ["Reported", "In Progress", "Resolved"];

function normalizeReport(report) {
  return {
    ...report,
    id: report._id,
    createdAt: new Date(report.createdAt).getTime()
  };
}

function timeAgo(timestamp) {
  const mins = Math.max(
    1,
    Math.floor((Date.now() - timestamp) / 60000)
  );

  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `${hours} hr ago`;

  return `${Math.floor(hours / 24)} day ago`;
}

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "Water leak",
    location: "",
    description: "",
    severity: "Medium"
  });

  // Load reports from MongoDB through the backend
  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load reports.");
        }

        const data = await response.json();
        setReports(data.map(normalizeReport));
      } catch (error) {
        console.error("Loading reports failed:", error);
        setNotice(
          "Could not load reports. Check whether the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // Dashboard statistics
  const counts = useMemo(
    () => ({
      total: reports.length,
      open: reports.filter(
        report => report.status === "Reported"
      ).length,
      progress: reports.filter(
        report => report.status === "In Progress"
      ).length,
      resolved: reports.filter(
        report => report.status === "Resolved"
      ).length
    }),
    [reports]
  );

  // Search and filter reports
  const visible = useMemo(() => {
    return reports
      .filter(report => {
        const matchesFilter =
          filter === "All" ||
          report.status === filter ||
          report.severity === filter ||
          report.type === filter;

        const haystack = [
          report.title,
          report.type,
          report.location,
          report.description
        ]
          .join(" ")
          .toLowerCase();

        return (
          matchesFilter &&
          haystack.includes(query.toLowerCase())
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, filter, query]);

  // Submit a new report to MongoDB
  async function submitReport(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report.");
      }

      setReports(previous => [
        normalizeReport(data),
        ...previous
      ]);

      setForm({
        title: "",
        type: "Water leak",
        location: "",
        description: "",
        severity: "Medium"
      });

      setShowForm(false);
      setNotice("Report saved to MongoDB.");
    } catch (error) {
      console.error("Submitting report failed:", error);
      setNotice(error.message || "Failed to submit report.");
    }
  }

  // Update status in MongoDB
  async function setStatus(id, status) {
    try {
      const response = await fetch(
        `${API_URL}/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setReports(previous =>
        previous.map(report =>
          report.id === id
            ? { ...report, status }
            : report
        )
      );

      setNotice("Report status updated.");
    } catch (error) {
      console.error("Updating status failed:", error);
      setNotice(error.message || "Failed to update status.");
    }
  }

  // Clear search and filter settings
  function resetDemo() {
    setQuery("");
    setFilter("All");
  }

  // Automatically hide notifications
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Droplets size={23} />
          </span>
          <span>
            Leak<span className="brand-light">Lens</span>
          </span>
        </div>

        <div className="side-label">WORKSPACE</div>

        <button className="nav-item active">
          <Gauge size={18} /> Overview
        </button>

        <button
          className="nav-item"
          onClick={() => {
            setFilter("All");
            document
              .getElementById("reports")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Waves size={18} />
          Water reports
          <span className="nav-count">{counts.total}</span>
        </button>

        <div className="side-bottom">
          <div className="impact-card">
            <div className="impact-icon">
              <Leaf size={18} />
            </div>
            <b>Every drop counts.</b>
            <p>
              Small reports can help communities act sooner.
            </p>
          </div>

          <div className="privacy-note">
            <ShieldCheck size={15} />
            Community-powered reporting
          </div>

          <div className="side-foot">LEAKLENS MVP · 2026</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <b>Overview</b>
          </div>

          <div className="top-right">
            <span className="live-dot"></span>
            MongoDB workspace
            <div className="avatar">LL</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              HEAT & WATER · COMMUNITY RESPONSE
            </div>

            <h1>
              Water issues,
              <br />
              <em>made visible.</em>
            </h1>

            <p className="welcome-copy">
              Spot a problem. Report it clearly. Follow the response.
              <br className="desktop-break" />
              Let's make every drop count.
            </p>

            <button
              className="primary-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Report a water issue
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div
            className="hero-art"
            aria-label="Water conservation illustration"
          >
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>

            <div className="water-drop">
              <Droplets size={78} strokeWidth={1.2} />
            </div>

            <div className="art-tag tag-top">
              <span className="tag-pulse"></span>
              COMMUNITY SIGNAL
            </div>

            <div className="art-tag tag-bottom">
              <Waves size={15} /> Report · Track · Resolve
            </div>

            <span className="art-spark spark-one">✳</span>
            <span className="art-spark spark-two">✦</span>
          </div>
        </section>

        <section className="stats-grid">
          <Stat
            icon={<Waves size={19} />}
            label="Total reports"
            value={counts.total}
            hint="Community submissions"
            tone="teal"
          />

          <Stat
            icon={<AlertTriangle size={19} />}
            label="Needs attention"
            value={counts.open}
            hint="Awaiting action"
            tone="amber"
          />

          <Stat
            icon={<Clock3 size={19} />}
            label="In progress"
            value={counts.progress}
            hint="Being addressed"
            tone="blue"
          />

          <Stat
            icon={<CheckCircle2 size={19} />}
            label="Resolved"
            value={counts.resolved}
            hint="Marked complete"
            tone="green"
          />
        </section>

        <section className="reports-section" id="reports">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">COMMUNITY ACTIVITY</div>
              <h2>
                Water issue reports{" "}
                <span className="total-pill">{visible.length}</span>
              </h2>
              <p>
                Review incoming reports and keep their status up to date.
              </p>
            </div>

            <button className="outline-btn" onClick={resetDemo}>
              <span>↻</span> Clear filters
            </button>
          </div>

          <div className="toolbar">
            <div className="searchbox">
              <Search size={17} />

              <input
                aria-label="Search reports"
                placeholder="Search reports, locations..."
                value={query}
                onChange={event => setQuery(event.target.value)}
              />

              {query && (
                <button
                  className="clear-search"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filterbox">
              <Filter size={16} />

              <select
                aria-label="Filter reports"
                value={filter}
                onChange={event => setFilter(event.target.value)}
              >
                <option>All</option>

                {STATUSES.map(status => (
                  <option key={status}>{status}</option>
                ))}

                {SEVERITIES.map(severity => (
                  <option key={severity}>{severity}</option>
                ))}

                {TYPES.map(type => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="report-list">
            {loading && <p>Loading reports from MongoDB...</p>}

            {!loading &&
              visible.map(report => (
                <article className="report-card" key={report.id}>
                  <div
                    className={`report-symbol ${
                      report.type === "Waterlogging" ||
                      report.type === "Flooding"
                        ? "symbol-blue"
                        : report.type === "Water shortage"
                        ? "symbol-amber"
                        : "symbol-teal"
                    }`}
                  >
                    <Droplets size={21} />
                  </div>

                  <div className="report-body">
                    <div className="report-title-row">
                      <h3>{report.title}</h3>

                      <span
                        className={`severity severity-${report.severity.toLowerCase()}`}
                      >
                        {report.severity} priority
                      </span>
                    </div>

                    <div className="report-meta">
                      <span>
                        <MapPin size={14} />
                        {report.location}
                      </span>

                      <span>
                        <Clock3 size={14} />
                        {timeAgo(report.createdAt)}
                      </span>

                      <span className="report-id">
                        {report.id}
                      </span>
                    </div>

                    <p className="report-desc">
                      {report.description}
                    </p>

                    <div className="report-foot">
                      <span
                        className={`status status-${report.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <span></span>
                        {report.status}
                      </span>

                      <label className="status-select-label">
                        Update status

                        <select
                          aria-label={`Update status for ${report.title}`}
                          value={report.status}
                          onChange={event =>
                            setStatus(report.id, event.target.value)
                          }
                        >
                          {STATUSES.map(status => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </article>
              ))}

            {!loading && visible.length === 0 && (
              <div className="empty-state">
                <Search size={27} />
                <b>No reports found</b>
                <p>
                  {reports.length === 0
                    ? "No reports have been submitted yet. Add the first report."
                    : "Try a different search or filter."}
                </p>

                <button
                  className="outline-btn"
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="list-footer">
            <span>
              Showing {visible.length} of {reports.length} reports
            </span>

            <span>
              <span className="tiny-dot"></span>
              Reports stored in MongoDB
            </span>
          </div>
        </section>

        <footer className="footer">
          <span>
            LeakLens <span>·</span> Built for more resilient communities.
          </span>

          <span>
            Hackathon MVP <span>·</span> Not an official emergency reporting service.
          </span>
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <form className="modal" onSubmit={submitReport}>
            <div className="modal-head">
              <div>
                <div className="eyebrow muted">
                  COMMUNITY SUBMISSION
                </div>

                <h2>Report a water issue</h2>

                <p>
                  Share enough detail for someone to understand the problem.
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Issue title

              <input
                required
                maxLength="80"
                placeholder="e.g. Water leaking near the bus stop"
                value={form.title}
                onChange={event =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </label>

            <div className="form-row">
              <label>
                Issue type

                <select
                  value={form.type}
                  onChange={event =>
                    setForm({ ...form, type: event.target.value })
                  }
                >
                  {TYPES.map(type => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label>
                Priority

                <select
                  value={form.severity}
                  onChange={event =>
                    setForm({ ...form, severity: event.target.value })
                  }
                >
                  {SEVERITIES.map(severity => (
                    <option key={severity}>{severity}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Location

              <input
                required
                maxLength="120"
                placeholder="Area, landmark or street"
                value={form.location}
                onChange={event =>
                  setForm({ ...form, location: event.target.value })
                }
              />
            </label>

            <label>
              Description

              <textarea
                required
                maxLength="500"
                rows="3"
                placeholder="What did you notice? Is anyone affected?"
                value={form.description}
                onChange={event =>
                  setForm({
                    ...form,
                    description: event.target.value
                  })
                }
              />
            </label>

            <div className="form-note">
              <ShieldCheck size={16} />
              Do not include personal or sensitive information.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="outline-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                <Plus size={17} />
                Submit report
              </button>
            </div>
          </form>
        </div>
      )}

      {notice && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, hint, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
