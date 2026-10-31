
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./AdminDashboard";

const ADMIN_EMAILS = [
  "prernadixit14@gmail.com",
  "tanvi060706@gmail.com"
];

function ProtectedRoute({ children, requiredRole, user }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const email = user.email?.toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(email);

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/user" replace />;
  }

  if (requiredRole === "user" && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const email = currentUser.email.toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(email);

        sessionStorage.setItem(
          "campusfixRole",
          isAdmin ? "admin" : "user"
        );
        sessionStorage.setItem("campusfixUserEmail", email);

        const defaultName = email.split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        sessionStorage.setItem("campusfixUserName", defaultName);
      } else {
        sessionStorage.removeItem("campusfixRole");
        sessionStorage.removeItem("campusfixUserEmail");
        sessionStorage.removeItem("campusfixUserName");
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <p>Loading CampusFix...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/user"
        element={
          <ProtectedRoute user={user} requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
