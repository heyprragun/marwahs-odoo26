import { useState } from "react";
import "./Dashboard.css";

const NAV_ITEMS = ["Dashboard", "Assets", "Maintenance", "Lifecycles", "Op efficiencies"];

// 3.2 Dashboard KPIs
const KPI_LIST = [
  "Active Vehicles",
  "Available Vehicles",
  "Vehicles in Maintenance",
  "Active Trips",
  "Pending Trips",
  "Drivers On Duty",
  "Fleet Utilization (%)",
];

const DASHBOARD_FILTERS = ["Vehicle Type", "Status", "Region"];

// 3.3 Vehicle Registry columns
const ASSET_COLUMNS = [
  "Registration Number",
  "Vehicle Name/Model",
  "Type",
  "Max Load Capacity",
  "Odometer",
  "Acquisition Cost",
  "Status",
];

// 3.6 Maintenance log columns
const MAINTENANCE_COLUMNS = ["Vehicle", "Maintenance Type", "Date Logged", "Status"];

// 3.3 Vehicle status values
const VEHICLE_STATUS_VALUES = ["Available", "On Trip", "In Shop", "Retired"];

// Vehicle lifecycle stages (status values from 3.3 + maintenance rule from 3.6)
const LIFECYCLE_STAGES = ["Available", "On Trip", "In Shop", "Retired"];

// 3.8 Reports & Analytics
const OP_EFFICIENCY_METRICS = [
  { label: "Fuel Efficiency", formula: "Distance / Fuel" },
  { label: "Fleet Utilization", formula: "Active Vehicles / Total Vehicles" },
  { label: "Operational Cost", formula: "Fuel + Maintenance" },
  { label: "Vehicle ROI", formula: "(Revenue - (Maintenance + Fuel)) / Acquisition Cost" },
];

export default function FleetManagerDashboard({ onBack }) {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="brand">fleetops</span>
        <span className="role">Fleet manager</span>
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
          {active === "Dashboard" && <DashboardSection />}
          {active === "Assets" && <AssetsSection />}
          {active === "Maintenance" && <MaintenanceSection />}
          {active === "Lifecycles" && <LifecyclesSection />}
          {active === "Op efficiencies" && <OpEfficienciesSection />}
        </main>
      </div>
    </div>
  );
}

function DashboardSection() {
  return (
    <div className="section">
      <div className="filter-row">
        {DASHBOARD_FILTERS.map((f) => (
          <span key={f} className="filter-pill">{f}: All</span>
        ))}
      </div>

      <div className="kpi-grid">
        {KPI_LIST.map((kpi) => (
          <div className="kpi-card" key={kpi}>
            <div className="kpi-value">--</div>
            <div className="kpi-label">{kpi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsSection() {
  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Vehicle Registry</p>
        <button className="add-btn">+ Add Vehicle</button>
      </div>
      <input className="search-input" type="text" placeholder="Search by registration number..." />
      <p className="section-note">
        Registration Number must be unique across the fleet. Status values: {VEHICLE_STATUS_VALUES.join(", ")}.
      </p>
      <table className="mock-table">
        <thead>
          <tr>
            {ASSET_COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={ASSET_COLUMNS.length} className="empty-row">
              No vehicles registered yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function MaintenanceSection() {
  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Maintenance Log</p>
        <button className="add-btn">+ Add Maintenance Record</button>
      </div>
      <input className="search-input" type="text" placeholder="Search by vehicle..." />
      <p className="section-note">
        Adding a vehicle here automatically sets its status to "In Shop" and removes it from the driver's selection pool.
        Closing the record restores the vehicle to Available (unless retired).
      </p>
      <table className="mock-table">
        <thead>
          <tr>
            {MAINTENANCE_COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={MAINTENANCE_COLUMNS.length} className="empty-row">
              No maintenance records yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function LifecyclesSection() {
  return (
    <div className="section">
      <p className="section-title">Vehicle Lifecycle</p>
      <div className="lifecycle-row">
        {LIFECYCLE_STAGES.map((stage, i) => (
          <div className="lifecycle-item" key={stage}>
            <span className="lifecycle-pill">{stage}</span>
            {i < LIFECYCLE_STAGES.length - 1 && <span className="lifecycle-arrow">→</span>}
          </div>
        ))}
      </div>
      <p className="section-note">
        Retired or In Shop vehicles never appear in the dispatch selection pool.
      </p>
    </div>
  );
}

function OpEfficienciesSection() {
  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Reports &amp; Analytics</p>
        <button className="add-btn">Export CSV</button>
      </div>
      <div className="kpi-grid">
        {OP_EFFICIENCY_METRICS.map((m) => (
          <div className="kpi-card" key={m.label}>
            <div className="kpi-value">--</div>
            <div className="kpi-label">{m.label}</div>
            <div className="kpi-formula">{m.formula}</div>
          </div>
        ))}
      </div>
      <p className="section-note">Export wiring pending backend data. PDF export is optional (bonus).</p>
    </div>
  );
}