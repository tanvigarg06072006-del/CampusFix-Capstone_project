
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
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
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

    try {
      if (role === "admin" && !isAdmin) {
        setError("Invalid admin email or password.");
        return;
      }

      if (role === "user" && isAdmin) {
        setError("Please use Admin Login.");
        return;
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // Email verification is not required for login.

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }

    } catch (err) {
      console.error("FIREBASE LOGIN ERROR:", err.code, err.message);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("Account not found. Please create an account first.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else {
        setError(`Login failed: ${err.code || err.message}`);
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

    if (role === "admin" && !ADMIN_EMAILS.includes(cleanEmail)) {
      setError("Please enter an authorized admin email.");
      return;
    }

    setError("");

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setError("Password reset link sent to your email.");
    } catch (err) {
      console.error("PASSWORD RESET ERROR:", err);
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

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {role === "user" && (
          <p>
            New to CampusFix?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        )}

        <Link to="/">← Back to role selection</Link>

      </div>
    </div>
  );
}

export default Login;
