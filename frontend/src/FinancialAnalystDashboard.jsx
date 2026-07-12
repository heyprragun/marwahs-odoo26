import { useMemo, useState } from "react";
import "./Dashboard.css";
import { buildInitialVehicles } from "./data/vehicles";
import { buildInitialTrips } from "./data/trips";

const NAV_ITEMS = ["Dashboard", "Fuel Logs", "Expenses", "Reports"];

const EXPENSE_TYPES = ["Toll", "Maintenance", "Insurance", "Other"];

export default function FinancialAnalystDashboard({ onBack }) {
  const [active, setActive] = useState("Dashboard");
  const [vehicles] = useState(buildInitialVehicles);
  const [trips] = useState(buildInitialTrips);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + v.cost, 0);
  const totalOperationalCost = totalFuelCost + totalExpenseCost;

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="brand">fleetops</span>
        <span className="role">Financial analyst</span>
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
          {active === "Dashboard" && (
            <FinanceDashboardSection
              totalAcquisitionCost={totalAcquisitionCost}
              totalFuelCost={totalFuelCost}
              totalExpenseCost={totalExpenseCost}
              totalOperationalCost={totalOperationalCost}
              vehicleCount={vehicles.length}
            />
          )}
          {active === "Fuel Logs" && (
            <FuelLogsSection vehicles={vehicles} fuelLogs={fuelLogs} setFuelLogs={setFuelLogs} />
          )}
          {active === "Expenses" && (
            <ExpensesSection vehicles={vehicles} expenses={expenses} setExpenses={setExpenses} />
          )}
          {active === "Reports" && (
            <ReportsSection
              vehicles={vehicles}
              trips={trips}
              fuelLogs={fuelLogs}
              expenses={expenses}
              totalOperationalCost={totalOperationalCost}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function FinanceDashboardSection({
  totalAcquisitionCost,
  totalFuelCost,
  totalExpenseCost,
  totalOperationalCost,
  vehicleCount,
}) {
  const cards = [
    { label: "Fleet Acquisition Cost", value: `₹${totalAcquisitionCost.toLocaleString()}` },
    { label: "Total Fuel Cost", value: `₹${totalFuelCost.toLocaleString()}` },
    { label: "Total Expenses", value: `₹${totalExpenseCost.toLocaleString()}` },
    { label: "Total Operational Cost", value: `₹${totalOperationalCost.toLocaleString()}` },
    {
      label: "Avg Cost / Vehicle",
      value: vehicleCount ? `₹${Math.round(totalOperationalCost / vehicleCount).toLocaleString()}` : "--",
    },
  ];

  return (
    <div className="section">
      <p className="section-title">Financial Overview</p>
      <p className="section-note">Fuel, maintenance, and other operational expenses across the fleet.</p>
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

function FuelLogsSection({ vehicles, fuelLogs, setFuelLogs }) {
  const [showModal, setShowModal] = useState(false);

  function handleAdd(form) {
    setFuelLogs((prev) => [
      {
        id: Date.now(),
        vehicle: form.vehicle,
        liters: Number(form.liters),
        cost: Number(form.cost),
        date: form.date,
      },
      ...prev,
    ]);
    setShowModal(false);
  }

  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Fuel Logs</p>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Fuel Log</button>
      </div>
      <table className="mock-table">
        <thead>
          <tr>
            {["Vehicle", "Liters", "Cost", "Date"].map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {fuelLogs.length === 0 ? (
            <tr><td colSpan={4} className="empty-row">No fuel logs yet</td></tr>
          ) : (
            fuelLogs.map((f) => (
              <tr key={f.id}>
                <td>{f.vehicle}</td>
                <td>{f.liters} L</td>
                <td>₹{f.cost.toLocaleString()}</td>
                <td>{f.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <FuelExpenseModal
          title="Add Fuel Log"
          vehicles={vehicles}
          fields={[
            { key: "liters", label: "Liters", type: "number", placeholder: "e.g. 120" },
            { key: "cost", label: "Cost (INR)", type: "number", placeholder: "e.g. 12000" },
            { key: "date", label: "Date", type: "text", placeholder: "DD-MM-YYYY" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
}

function ExpensesSection({ vehicles, expenses, setExpenses }) {
  const [showModal, setShowModal] = useState(false);

  function handleAdd(form) {
    setExpenses((prev) => [
      {
        id: Date.now(),
        vehicle: form.vehicle,
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
      },
      ...prev,
    ]);
    setShowModal(false);
  }

  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Expenses</p>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Expense</button>
      </div>
      <table className="mock-table">
        <thead>
          <tr>
            {["Vehicle", "Type", "Amount", "Date"].map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr><td colSpan={4} className="empty-row">No expenses logged yet</td></tr>
          ) : (
            expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.vehicle}</td>
                <td>{e.type}</td>
                <td>₹{e.amount.toLocaleString()}</td>
                <td>{e.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <FuelExpenseModal
          title="Add Expense"
          vehicles={vehicles}
          fields={[
            {
              key: "type",
              label: "Expense Type",
              type: "select",
              options: EXPENSE_TYPES,
            },
            { key: "amount", label: "Amount (INR)", type: "number", placeholder: "e.g. 500" },
            { key: "date", label: "Date", type: "text", placeholder: "DD-MM-YYYY" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
}

function FuelExpenseModal({ title, vehicles, fields, onClose, onSubmit }) {
  const initial = { vehicle: "", ...Object.fromEntries(fields.map((f) => [f.key, ""])) };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  function handleChange(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.vehicle) {
      setError("Please select a vehicle.");
      return;
    }
    for (const f of fields) {
      if (!form[f.key]) {
        setError(`${f.label} is required.`);
        return;
      }
    }
    setError("");
    onSubmit(form);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p className="section-title">{title}</p>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-field">
            Vehicle
            <select value={form.vehicle} onChange={(e) => handleChange("vehicle", e.target.value)}>
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.registrationNumber} value={v.registrationNumber}>
                  {v.registrationNumber} — {v.model}
                </option>
              ))}
            </select>
          </label>

          {fields.map((f) =>
            f.type === "select" ? (
              <label className="modal-field" key={f.key}>
                {f.label}
                <select value={form[f.key]} onChange={(e) => handleChange(f.key, e.target.value)}>
                  <option value="">Select type</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="modal-field" key={f.key}>
                {f.label}
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              </label>
            )
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="add-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportsSection({ vehicles, trips, fuelLogs, expenses, totalOperationalCost }) {
  const totalDistance = trips
    .filter((t) => t.status === "Completed" && t.plannedDistance)
    .reduce((sum, t) => sum + t.plannedDistance, 0);
  const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  const fuelEfficiency = totalLiters ? (totalDistance / totalLiters).toFixed(2) : "--";

  const activeVehicles = vehicles.filter((v) => v.status !== "Retired").length;
  const fleetUtilization = vehicles.length
    ? Math.round((activeVehicles / vehicles.length) * 100)
    : 0;

  const metrics = [
    { label: "Fuel Efficiency", value: fuelEfficiency === "--" ? "--" : `${fuelEfficiency} km/L`, formula: "Distance / Fuel" },
    { label: "Fleet Utilization", value: `${fleetUtilization}%`, formula: "Active Vehicles / Total Vehicles" },
    { label: "Operational Cost", value: `₹${totalOperationalCost.toLocaleString()}`, formula: "Fuel + Maintenance + Expenses" },
    { label: "Vehicle ROI", value: "--", formula: "(Revenue - (Maintenance + Fuel)) / Acquisition Cost" },
  ];

  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Reports &amp; Analytics</p>
        <button className="add-btn">Export CSV</button>
      </div>
      <div className="kpi-grid">
        {metrics.map((m) => (
          <div className="kpi-card" key={m.label}>
            <div className="kpi-value">{m.value}</div>
            <div className="kpi-label">{m.label}</div>
            <div className="kpi-formula">{m.formula}</div>
          </div>
        ))}
      </div>
      <p className="section-note">
        Vehicle ROI needs a revenue figure per trip, which isn't tracked yet — add revenue capture to compute it.
        Export wiring pending backend data. PDF export is optional (bonus).
      </p>
    </div>
  );
}
