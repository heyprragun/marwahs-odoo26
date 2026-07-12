import { useState } from 'react'
import './App.css'

const ROLES = ["Fleet manager", "Driver", "Safety officer", "Financial analyst"];

function Login({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onLoginSuccess(selectedRole);
  }

  return (
    <div className="home-div">
      <h1>Login as</h1>

      <div className="users">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </button>
        ))}
      </div>

      {selectedRole && (
        <form className="cred-form" onSubmit={handleSubmit}>
          <p>Signing in as {selectedRole}</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Sign in</button>
        </form>
      )}
    </div>
  );
}

import FleetManagerDashboard from './Dashboard'
import DriverDashboard from './DriverDashboard'
import SafetyOfficerDashboard from './SafetyOfficerDashboard'
import FinancialAnalystDashboard from './FinancialAnalystDashboard'

function App() {
  const [loggedInRole, setLoggedInRole] = useState(null);

  if (!loggedInRole) {
    return <Login onLoginSuccess={(role) => setLoggedInRole(role)} />;
  }

  const onBack = () => setLoggedInRole(null);

  if (loggedInRole === "Fleet manager") {
    return <FleetManagerDashboard onBack={onBack} />;
  }
  if (loggedInRole === "Driver") {
    return <DriverDashboard onBack={onBack} />;
  }
  if (loggedInRole === "Safety officer") {
    return <SafetyOfficerDashboard onBack={onBack} />;
  }
  if (loggedInRole === "Financial analyst") {
    return <FinancialAnalystDashboard onBack={onBack} />;
  }

  return <p>Dashboard for {loggedInRole} coming soon</p>;
}

export default App