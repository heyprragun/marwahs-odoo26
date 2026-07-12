import { useMemo, useState } from "react";
import "./Dashboard.css";
import {
  buildInitialDrivers,
  isLicenseExpired,
  daysUntilExpiry,
  DRIVER_STATUS_VALUES,
  LICENSE_CATEGORIES,
} from "./data/drivers";

const NAV_ITEMS = ["Dashboard", "Drivers", "License Compliance", "Safety Scores"];

const DRIVER_COLUMNS = [
  "Name",
  "License Number",
  "Category",
  "License Expiry",
  "Contact",
  "Safety Score",
  "Status",
];

const EXPIRY_WARNING_DAYS = 30;

export default function SafetyOfficerDashboard({ onBack }) {
  const [active, setActive] = useState("Dashboard");
  const [drivers, setDrivers] = useState(buildInitialDrivers);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  function suspendDriver(id) {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Suspended" } : d))
    );
  }

  function reinstateDriver(id) {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Available" } : d))
    );
  }

  const filteredDrivers = drivers.filter(
    (d) =>
      (statusFilter === "All" || d.status === statusFilter) &&
      (categoryFilter === "All" || d.licenseCategory === categoryFilter)
  );

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="brand">fleetops</span>
        <span className="role">Safety officer</span>
        <button className="back-btn" onClick={onBack}>← Back to login</button>
      </header>

      <div className="layout">
        <nav className="sidebar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className={`nav-btn ${active === item ? "nav-btn-active" : ""}`}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <main className="content">
          {active === "Dashboard" && <SafetyDashboardSection drivers={drivers} />}
          {active === "Drivers" && (
            <DriversSection
              drivers={filteredDrivers}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onSuspend={suspendDriver}
              onReinstate={reinstateDriver}
            />
          )}
          {active === "License Compliance" && <LicenseComplianceSection drivers={drivers} />}
          {active === "Safety Scores" && <SafetyScoresSection drivers={drivers} />}
        </main>
      </div>
    </div>
  );
}

function SafetyDashboardSection({ drivers }) {
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status !== "Suspended").length;
  const expiredLicenses = drivers.filter((d) => isLicenseExpired(d.licenseValidity)).length;
  const suspendedDrivers = drivers.filter((d) => d.status === "Suspended").length;
  const avgSafetyScore = totalDrivers
    ? Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / totalDrivers)
    : 0;
  const lowScoreDrivers = drivers.filter((d) => d.safetyScore < 65).length;

  const cards = [
    { label: "Total Drivers", value: totalDrivers },
    { label: "Active Drivers", value: activeDrivers },
    { label: "Expired Licenses", value: expiredLicenses },
    { label: "Suspended Drivers", value: suspendedDrivers },
    { label: "Avg Safety Score", value: avgSafetyScore },
    { label: "Low Safety Score (<65)", value: lowScoreDrivers },
  ];

  return (
    <div className="section">
      <p className="section-title">Safety Overview</p>
      <p className="section-note">Driver compliance, license validity, and safety score monitoring.</p>
      <div className="kpi-grid">
        {cards.map((c) => (
          <div className="kpi-card" key={c.label}>
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriversSection({
  drivers,
  statusFilter,
  categoryFilter,
  onStatusFilterChange,
  onCategoryFilterChange,
  onSuspend,
  onReinstate,
}) {
  const [search, setSearch] = useState("");
  const visible = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section">
      <p className="section-title">Driver Compliance</p>
      <div className="filter-row">
        <label className="filter-pill">
          Status:
          <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
            {["All", ...DRIVER_STATUS_VALUES].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label className="filter-pill">
          Category:
          <select value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)}>
            {["All", ...LICENSE_CATEGORIES].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>
      <input
        className="search-input"
        type="text"
        placeholder="Search by driver name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="mock-table">
        <thead>
          <tr>
            {[...DRIVER_COLUMNS, "Actions"].map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={DRIVER_COLUMNS.length + 1} className="empty-row">No drivers match this filter</td>
            </tr>
          ) : (
            visible.map((d) => {
              const expired = isLicenseExpired(d.licenseValidity);
              return (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{d.licenseCategory}</td>
                  <td style={expired ? { color: "#a11", fontWeight: 700 } : undefined}>
                    {d.licenseValidity}{expired ? " (expired)" : ""}
                  </td>
                  <td>{d.contact}</td>
                  <td>{d.safetyScore}</td>
                  <td>{d.status}</td>
                  <td>
                    {d.status === "Suspended" ? (
                      <button className="add-btn" onClick={() => onReinstate(d.id)}>Reinstate</button>
                    ) : (
                      <button className="back-btn" onClick={() => onSuspend(d.id)}>Suspend</button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function LicenseComplianceSection({ drivers }) {
  const flagged = useMemo(
    () =>
      drivers
        .map((d) => ({ ...d, daysLeft: daysUntilExpiry(d.licenseValidity) }))
        .filter((d) => d.daysLeft <= EXPIRY_WARNING_DAYS)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [drivers]
  );

  return (
    <div className="section">
      <p className="section-title">License Compliance</p>
      <p className="section-note">
        Drivers whose license has already expired, or expires within {EXPIRY_WARNING_DAYS} days.
        Expired/suspended drivers cannot be assigned to trips.
      </p>
      <table className="mock-table">
        <thead>
          <tr>
            {["Name", "License Number", "Category", "Expiry Date", "Days Left", "Status"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flagged.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-row">No licenses expiring soon</td>
            </tr>
          ) : (
            flagged.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.licenseNumber}</td>
                <td>{d.licenseCategory}</td>
                <td>{d.licenseValidity}</td>
                <td style={{ color: d.daysLeft < 0 ? "#a11" : "#8a6d00", fontWeight: 700 }}>
                  {d.daysLeft < 0 ? `Expired ${Math.abs(d.daysLeft)}d ago` : `${d.daysLeft}d`}
                </td>
                <td>{d.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SafetyScoresSection({ drivers }) {
  const sorted = useMemo(
    () => [...drivers].sort((a, b) => a.safetyScore - b.safetyScore),
    [drivers]
  );

  return (
    <div className="section">
      <p className="section-title">Safety Scores</p>
      <p className="section-note">Drivers sorted lowest score first — review these for coaching or restrictions.</p>
      <table className="mock-table">
        <thead>
          <tr>
            {["Name", "Safety Score", "Experience (Years)", "License Category", "Status"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td style={{ fontWeight: 700, color: d.safetyScore < 65 ? "#a11" : "#1a1a1a" }}>
                {d.safetyScore}
              </td>
              <td>{d.experience}</td>
              <td>{d.licenseCategory}</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
