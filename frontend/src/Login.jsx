
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate, useParams } from "react-router-dom";

const ADMIN_EMAILS = [
  "prernadixit14@gmail.com",
  "tanvi060706@gmail.com"
];

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

    if (role === "admin" && !isAdmin) {
      setError("Invalid admin email. Access denied.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const loggedInEmail = userCredential.user.email.toLowerCase();
      const loggedInIsAdmin = ADMIN_EMAILS.includes(loggedInEmail);

      if (loggedInIsAdmin) {
        sessionStorage.setItem("campusfixRole", "admin");
        navigate("/admin");
      } else {
        sessionStorage.setItem("campusfixRole", "user");
        navigate("/user");
      }
    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address first.");
      return;
    }

    setError("");

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setError("Password reset link has been sent to your email.");
    } catch (err) {
      setError("Unable to send reset link. Please check your email.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>CampusFix</h1>
        <h2>{role === "admin" ? "Admin Login" : "User Login"}</h2>
        <p>Welcome! Login to continue.</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>

          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {role !== "admin" && (
          <p>
            New to CampusFix? <Link to="/register">Create an account</Link>
          </p>
        )}

        <Link to="/">← Back to role selection</Link>
      </div>
    </div>
  );
}

export default Login;
