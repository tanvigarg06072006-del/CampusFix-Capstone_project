
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const allowedAdmins = [
    "prernadixit14@gmail.com",
    "tanvi060706@gmail.com"
  ];

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    const enteredEmail = email.trim().toLowerCase();

    if (!enteredEmail || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (role === "admin") {
      if (!allowedAdmins.includes(enteredEmail)) {
        setError("Invalid Admin Email! You are not authorised.");
        return;
      }

      sessionStorage.setItem("campusfixRole", "admin");
      sessionStorage.setItem("campusfixUserEmail", enteredEmail);
      sessionStorage.setItem(
        "campusfixUserName",
        enteredEmail === "prernadixit14@gmail.com"
          ? "Prerna"
          : "Tanvi"
      );

      navigate("/admin");
      return;
    }

    if (role === "user") {
      sessionStorage.setItem("campusfixRole", "user");
      sessionStorage.setItem("campusfixUserEmail", enteredEmail);

      const defaultName = enteredEmail.split("@")[0];
      const formattedName = defaultName
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

      sessionStorage.setItem("campusfixUserName", formattedName);

      navigate("/user");
      return;
    }

    setError("Invalid role selected.");
  }

  return (
    <div className="welcome-page">
      <div className="login-card">

        <div className="login-header">
          <h1>CampusFix</h1>

          <h2>
            {role === "admin" ? "Admin Login" : "User Login"}
          </h2>

          <p>
            {role === "admin"
              ? "Access your administration dashboard."
              : "Welcome! Login to report campus complaints."}
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email address"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>

            <div className="password-box">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-submit">
            Login
          </button>

        </form>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to role selection
        </button>

      </div>
    </div>
  );
}
