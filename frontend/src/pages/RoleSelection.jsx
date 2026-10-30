
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <h1>CampusFix</h1>
      <p>Your Campus, Your Voice!</p>
      <h2>Welcome to CampusFix</h2>
      <p>Select how you want to continue</p>

      <div className="role-container">
        <div className="role-card" onClick={() => navigate("/login/user")}>
          <h2>👨‍🎓 User</h2>
          <p>Report and track campus complaints</p>
          <button>Continue as User</button>
        </div>

        <div className="role-card" onClick={() => navigate("/login/admin")}>
          <h2>🛡️ Admin</h2>
          <p>Manage and resolve campus complaints</p>
          <button>Continue as Admin</button>
        </div>
      </div>
    </div>
  );
}
