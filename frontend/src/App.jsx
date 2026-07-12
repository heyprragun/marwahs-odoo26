import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div className="home-div">
//         <h1> Login as </h1>
//         <div className='users'>
//           <a> Fleet manager </a>
//           <a> Trip manager </a>
//           <a> Finance manager </a>
//         </div>
//       </div>
//     </>
//   )
// }


const ROLES = ["Fleet manager", "Trip manager", "Finance manager"];

function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: call your auth function here, e.g. mockLogin(username, password, selectedRole)
    console.log(selectedRole, username, password);
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

export default Login
