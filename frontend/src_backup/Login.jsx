import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiRequest } from "./api";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const user = data.user;

      if (!data.token || !user) {
        throw new Error("The server returned an unexpected login response.");
      }

      if (user.role?.toLowerCase() !== role.toLowerCase()) {
        throw new Error(`This account is not registered as ${role}.`);
      }

      localStorage.setItem("campusfix_token", data.token);
      localStorage.setItem("campusfix_user", JSON.stringify(user));

      navigate(role === "admin" ? "/admin" : "/user");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <Link to="/" className="back-link">← Back</Link>
        <h1>{role === "admin" ? "Admin Login" : "User Login"}</h1>
        <p>Sign in to your CampusFix account.</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}