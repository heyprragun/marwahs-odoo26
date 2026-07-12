import { useMemo, useState } from "react";
import "./Dashboard.css";
import { buildInitialVehicles } from "./data/vehicles";
import { buildInitialDrivers, isLicenseExpired } from "./data/drivers";
import { buildInitialTrips, TRIP_STATUS_VALUES } from "./data/trips";

const NAV_ITEMS = ["Dashboard", "Trips", "Active Deliveries"];

const TRIP_COLUMNS = [
  "Source",
  "Destination",
  "Vehicle",
  "Driver",
  "Cargo (kg)",
  "Distance (km)",
  "Status",
  "Actions",
];

export default function DriverDashboard({ onBack }) {
  const [active, setActive] = useState("Dashboard");
  const [vehicles, setVehicles] = useState(buildInitialVehicles);
  const [drivers, setDrivers] = useState(buildInitialDrivers);
  const [trips, setTrips] = useState(buildInitialTrips);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // Vehicles eligible for dispatch: Available status only (never Retired/In Shop/On Trip)
  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  // Drivers eligible: Available status and license not expired
  const availableDrivers = drivers.filter(
    (d) => d.status === "Available" && !isLicenseExpired(d.licenseValidity)
  );

  function handleCreateTrip(form) {
    const vehicle = vehicles.find((v) => v.registrationNumber === form.vehicle);
    const cargo = Number(form.cargoWeight);

    const newTrip = {
      id: Date.now(),
      source: form.source.trim(),
      destination: form.destination.trim(),
      vehicle: form.vehicle,
      driver: form.driver,
      cargoWeight: cargo,
      plannedDistance: Number(form.plannedDistance) || null,
      departureDate: null,
      departureTime: null,
      arrivalDate: null,
      arrivalTime: null,
      status: "Draft",
    };
    setTrips((prev) => [newTrip, ...prev]);
    setShowModal(false);
  }

  function dispatchTrip(tripId) {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: "Dispatched" } : t))
    );
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setVehicles((prev) =>
      prev.map((v) => (v.registrationNumber === trip.vehicle ? { ...v, status: "On Trip" } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.name === trip.driver ? { ...d, status: "On trip" } : d))
    );
  }

  function completeTrip(tripId) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: "Completed" } : t))
    );
    setVehicles((prev) =>
      prev.map((v) =>
        v.registrationNumber === trip.vehicle && v.status !== "Retired"
          ? { ...v, status: "Available" }
          : v
      )
    );
    setDrivers((prev) =>
      prev.map((d) => (d.name === trip.driver ? { ...d, status: "Available" } : d))
    );
  }

  function cancelTrip(tripId) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: "Cancelled" } : t))
    );
    if (trip.status === "Dispatched") {
      setVehicles((prev) =>
        prev.map((v) =>
          v.registrationNumber === trip.vehicle && v.status !== "Retired"
            ? { ...v, status: "Available" }
            : v
        )
      );
      setDrivers((prev) =>
        prev.map((d) => (d.name === trip.driver ? { ...d, status: "Available" } : d))
      );
    }
  }

  const visibleTrips = trips.filter(
    (t) => statusFilter === "All" || t.status === statusFilter
  );

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="brand">fleetops</span>
        <span className="role">Driver</span>
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
            <DriverDashboardSection trips={trips} vehicles={vehicles} drivers={drivers} />
          )}
          {active === "Trips" && (
            <TripsSection
              trips={visibleTrips}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onAdd={() => setShowModal(true)}
              onDispatch={dispatchTrip}
              onComplete={completeTrip}
              onCancel={cancelTrip}
            />
          )}
          {active === "Active Deliveries" && (
            <ActiveDeliveriesSection trips={trips.filter((t) => t.status === "Dispatched")} />
          )}
        </main>
      </div>

      {showModal && (
        <NewTripModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTrip}
          availableVehicles={availableVehicles}
          availableDrivers={availableDrivers}
        />
      )}
    </div>
  );
}

function DriverDashboardSection({ trips, vehicles, drivers }) {
  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const completedTrips = trips.filter((t) => t.status === "Completed").length;
  const availableVehicleCount = vehicles.filter((v) => v.status === "Available").length;
  const availableDriverCount = drivers.filter((d) => d.status === "Available").length;

  const cards = [
    { label: "Active Trips", value: activeTrips },
    { label: "Pending Trips (Draft)", value: pendingTrips },
    { label: "Completed Trips", value: completedTrips },
    { label: "Available Vehicles", value: availableVehicleCount },
    { label: "Available Drivers", value: availableDriverCount },
  ];

  return (
    <div className="section">
      <p className="section-title">Driver Overview</p>
      <p className="section-note">Create trips, dispatch them, and monitor active deliveries.</p>
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

function TripsSection({
  trips,
  statusFilter,
  onStatusFilterChange,
  onAdd,
  onDispatch,
  onComplete,
  onCancel,
}) {
  return (
    <div className="section">
      <div className="action-row">
        <p className="section-title">Trips</p>
        <button className="add-btn" onClick={onAdd}>+ New Trip</button>
      </div>

      <div className="filter-row">
        <label className="filter-pill">
          Status:
          <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
            {["All", ...TRIP_STATUS_VALUES].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>

      <table className="mock-table">
        <thead>
          <tr>
            {TRIP_COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trips.length === 0 ? (
            <tr>
              <td colSpan={TRIP_COLUMNS.length} className="empty-row">No trips match this filter</td>
            </tr>
          ) : (
            trips.map((t) => (
              <tr key={t.id}>
                <td>{t.source}</td>
                <td>{t.destination}</td>
                <td>{t.vehicle || "—"}</td>
                <td>{t.driver || "—"}</td>
                <td>{t.cargoWeight ?? "—"}</td>
                <td>{t.plannedDistance ?? "—"}</td>
                <td>{t.status}</td>
                <td>
                  {t.status === "Draft" && (
                    <button
                      className="add-btn"
                      disabled={!t.vehicle || !t.driver}
                      onClick={() => onDispatch(t.id)}
                    >
                      Dispatch
                    </button>
                  )}
                  {t.status === "Dispatched" && (
                    <>
                      <button className="add-btn" onClick={() => onComplete(t.id)}>Complete</button>{" "}
                      <button className="back-btn" onClick={() => onCancel(t.id)}>Cancel</button>
                    </>
                  )}
                  {(t.status === "Completed" || t.status === "Cancelled") && "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActiveDeliveriesSection({ trips }) {
  return (
    <div className="section">
      <p className="section-title">Active Deliveries</p>
      <p className="section-note">Trips currently dispatched and in transit.</p>
      <table className="mock-table">
        <thead>
          <tr>
            {["Source", "Destination", "Vehicle", "Driver", "Cargo (kg)", "Distance (km)"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trips.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-row">No active deliveries right now</td>
            </tr>
          ) : (
            trips.map((t) => (
              <tr key={t.id}>
                <td>{t.source}</td>
                <td>{t.destination}</td>
                <td>{t.vehicle}</td>
                <td>{t.driver}</td>
                <td>{t.cargoWeight}</td>
                <td>{t.plannedDistance ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function NewTripModal({ onClose, onSubmit, availableVehicles, availableDrivers }) {
  const [form, setForm] = useState({
    source: "",
    destination: "",
    vehicle: "",
    driver: "",
    cargoWeight: "",
    plannedDistance: "",
  });
  const [error, setError] = useState("");

  function handleChange(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.source.trim() || !form.destination.trim()) {
      setError("Source and destination are required.");
      return;
    }
    if (!form.vehicle) {
      setError("Please select a vehicle.");
      return;
    }
    if (!form.driver) {
      setError("Please select a driver.");
      return;
    }
    if (!form.cargoWeight || Number(form.cargoWeight) <= 0) {
      setError("Cargo weight must be a positive number.");
      return;
    }

    const vehicle = availableVehicles.find((v) => v.registrationNumber === form.vehicle);
    if (vehicle && Number(form.cargoWeight) > vehicle.maxCargo) {
      setError(
        `Cargo weight (${form.cargoWeight} kg) exceeds ${vehicle.registrationNumber}'s max load capacity (${vehicle.maxCargo} kg).`
      );
      return;
    }

    setError("");
    onSubmit(form);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p className="section-title">New Trip</p>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-field">
            Source
            <input value={form.source} onChange={(e) => handleChange("source", e.target.value)} placeholder="e.g. Delhi" />
          </label>
          <label className="modal-field">
            Destination
            <input value={form.destination} onChange={(e) => handleChange("destination", e.target.value)} placeholder="e.g. Mumbai" />
          </label>
          <label className="modal-field">
            Vehicle (available only)
            <select value={form.vehicle} onChange={(e) => handleChange("vehicle", e.target.value)}>
              <option value="">Select a vehicle</option>
              {availableVehicles.map((v) => (
                <option key={v.registrationNumber} value={v.registrationNumber}>
                  {v.registrationNumber} — {v.model} (max {v.maxCargo.toLocaleString()} kg)
                </option>
              ))}
            </select>
          </label>
          <label className="modal-field">
            Driver (available, valid license only)
            <select value={form.driver} onChange={(e) => handleChange("driver", e.target.value)}>
              <option value="">Select a driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} — {d.licenseCategory} (score {d.safetyScore})
                </option>
              ))}
            </select>
          </label>
          <label className="modal-field">
            Cargo Weight (kg)
            <input type="number" value={form.cargoWeight} onChange={(e) => handleChange("cargoWeight", e.target.value)} placeholder="e.g. 5000" />
          </label>
          <label className="modal-field">
            Planned Distance (km)
            <input type="number" value={form.plannedDistance} onChange={(e) => handleChange("plannedDistance", e.target.value)} placeholder="e.g. 350" />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="add-btn">Create Trip</button>
          </div>
        </form>
      </div>
    </div>
  );
}
