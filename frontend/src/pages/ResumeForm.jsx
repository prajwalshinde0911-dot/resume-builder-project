import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const API_URL = "https://resume-builder-project-ww7m.onrender.com";

function ResumeForm() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
  });
  const [resumeId, setResumeId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Load existing resume if one already exists
    fetch(`${API_URL}/resumes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setForm(data[0]);
          setResumeId(data[0].id);
        }
      });
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const url = resumeId ? `${API_URL}/resumes/${resumeId}` : `${API_URL}/resumes`;
      const method = resumeId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to save resume");

      const data = await response.json();
      setResumeId(data.id);
      setMessage("Resume saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: "flex-start", padding: "40px 20px" }}>
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h1 className="auth-title">Build Your Resume</h1>
        <p className="auth-subtitle">Fill in your details below.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Full Name</label>
            <input name="full_name" value={form.full_name || ""} onChange={handleChange} />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input name="email" value={form.email || ""} onChange={handleChange} />
          </div>

          <div className="auth-field">
            <label>Phone</label>
            <input name="phone" value={form.phone || ""} onChange={handleChange} />
          </div>

          <div className="auth-field">
            <label>Summary</label>
            <textarea
              name="summary"
              value={form.summary || ""}
              onChange={handleChange}
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div className="auth-field">
            <label>Experience</label>
            <textarea
              name="experience"
              value={form.experience || ""}
              onChange={handleChange}
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div className="auth-field">
            <label>Education</label>
            <textarea
              name="education"
              value={form.education || ""}
              onChange={handleChange}
              rows={2}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div className="auth-field">
            <label>Skills</label>
            <input name="skills" value={form.skills || ""} onChange={handleChange} placeholder="Comma separated" />
          </div>

          <div className="auth-field">
            <label>GitHub URL</label>
            <input name="github_url" value={form.github_url || ""} onChange={handleChange} />
          </div>

          <div className="auth-field">
            <label>LinkedIn URL</label>
            <input name="linkedin_url" value={form.linkedin_url || ""} onChange={handleChange} />
          </div>

          <div className="auth-field">
            <label>Portfolio URL</label>
            <input name="portfolio_url" value={form.portfolio_url || ""} onChange={handleChange} />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Resume"}
          </button>
        </form>

        <p className="auth-switch">
          <a onClick={() => navigate("/dashboard")}>← Back to Dashboard</a>
        </p>
      </div>
    </div>
  );
}

export default ResumeForm;