import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1>Welcome to your Dashboard 🎉</h1>
      <p>Build and manage your resume below.</p>

      <button
        onClick={() => navigate("/resume")}
        style={{
          marginTop: "10px",
          marginRight: "10px",
          padding: "10px 20px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Build / Edit Resume
      </button>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}

export default Dashboard;