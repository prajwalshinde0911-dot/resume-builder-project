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
      <p>This is where your resumes will live once we build the resume builder.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
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