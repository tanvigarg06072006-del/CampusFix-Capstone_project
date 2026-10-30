
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    // Temporary frontend demonstration only.
    // Real authentication will be connected to backend.
    if (role !== "user" && role !== "admin") {
      setError("Invalid role");
      return;
    }

    sessionStorage.setItem("campusfixRole", role);
    navigate(role === "admin" ? "/admin" : "/user");
  }

  return (
    <div className="welcome-page">
      <div className="login-card">
        <h1>CampusFix</h1>
        <h2>{role === "admin" ? "Admin Login" : "User Login"}</h2>

        <form onSubmit={handleLogin}>
          <label>Email / Username</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email or username"
          />

          <label>Password</label>
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Login</button>
        </form>

        <button className="back-button" onClick={() => navigate("/")}>
          Back to role selection
        </button>
      </div>
    </div>
  );
}
