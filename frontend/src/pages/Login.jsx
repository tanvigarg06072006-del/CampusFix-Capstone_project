
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getIdTokenResult
} from "firebase/auth";

import { auth } from "../firebase";
import { Link, useNavigate, useParams } from "react-router-dom";

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

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const user = credential.user;

      if (!user.emailVerified) {
        await auth.signOut();
        setError("Please verify your email before logging in.");
        return;
      }

      const token = await getIdTokenResult(user, true);
      const isAdmin = token.claims.admin === true;

      if (role === "admin" && !isAdmin) {
        await auth.signOut();
        setError("Access denied. You are not an authorized admin.");
        return;
      }

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your email and password.");
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

        {/* Only students can create accounts */}
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
