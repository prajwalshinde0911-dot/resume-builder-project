import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const API_URL = "https://resume-builder-project-ww7m.onrender.com";

const emptyExperience = { title: "", company: "", duration: "", description: "" };
const emptyEducation = { degree: "", institution: "", year: "" };
const emptyProject = { title: "", description: "", link: "" };
const emptyCertification = { name: "", issuer: "", year: "" };

function ResumeForm() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    summary: "",
    experience: [emptyExperience],
    education: [emptyEducation],
    skills: [""],
    projects: [emptyProject],
    certifications: [emptyCertification],
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
    fetch(`${API_URL}/resumes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const r = data[0];
          setForm({
            ...r,
            experience: r.experience?.length ? r.experience : [emptyExperience],
            education: r.education?.length ? r.education : [emptyEducation],
            skills: r.skills?.length ? r.skills : [""],
            projects: r.projects?.length ? r.projects : [emptyProject],
            certifications: r.certifications?.length ? r.certifications : [emptyCertification],
          });
          setResumeId(r.id);
        }
      });
  }, [token, navigate]);

  // --- simple field handlers ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- list section handlers (experience, education, projects, certifications) ---
  const handleListChange = (section, index, field, value) => {
    const updated = [...form[section]];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, [section]: updated });
  };

  const addItem = (section, emptyItem) => {
    setForm({ ...form, [section]: [...form[section], emptyItem] });
  };

  const removeItem = (section, index) => {
    const updated = form[section].filter((_, i) => i !== index);
    setForm({ ...form, [section]: updated });
  };

  // --- skills (plain strings, not objects) ---
  const handleSkillChange = (index, value) => {
    const updated = [...form.skills];
    updated[index] = value;
    setForm({ ...form, skills: updated });
  };

  const addSkill = () => {
    setForm({ ...form, skills: [...form.skills, ""] });
  };

  const removeSkill = (index) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        skills: form.skills.filter((s) => s.trim() !== ""),
      };

      const url = resumeId ? `${API_URL}/resumes/${resumeId}` : `${API_URL}/resumes`;
      const method = resumeId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

  const textareaStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: "14px",
  };

  const sectionBoxStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "14px",
    position: "relative",
  };

  const removeBtnStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "12px",
    cursor: "pointer",
  };

  const addBtnStyle = {
    background: "#eef2ff",
    color: "#4f46e5",
    border: "1px dashed #4f46e5",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "24px",
  };

  return (
    <div className="auth-page" style={{ alignItems: "flex-start", padding: "40px 20px" }}>
      <div className="auth-card" style={{ maxWidth: "650px" }}>
        <h1 className="auth-title">Build Your Resume</h1>
        <p className="auth-subtitle">Fill in your details below. Add as many entries as you need.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic details */}
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
            <textarea name="summary" value={form.summary || ""} onChange={handleChange} rows={3} style={textareaStyle} />
          </div>

          {/* Experience */}
          <h3 style={{ marginTop: "28px", marginBottom: "10px" }}>Experience</h3>
          {form.experience.map((exp, index) => (
            <div key={index} style={sectionBoxStyle}>
              {form.experience.length > 1 && (
                <button type="button" style={removeBtnStyle} onClick={() => removeItem("experience", index)}>
                  Remove
                </button>
              )}
              <div className="auth-field">
                <label>Job Title</label>
                <input value={exp.title || ""} onChange={(e) => handleListChange("experience", index, "title", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Company</label>
                <input value={exp.company || ""} onChange={(e) => handleListChange("experience", index, "company", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Duration</label>
                <input value={exp.duration || ""} onChange={(e) => handleListChange("experience", index, "duration", e.target.value)} placeholder="e.g. Jun 2026 - Present" />
              </div>
              <div className="auth-field">
                <label>Description</label>
                <textarea value={exp.description || ""} onChange={(e) => handleListChange("experience", index, "description", e.target.value)} rows={2} style={textareaStyle} />
              </div>
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => addItem("experience", emptyExperience)}>
            + Add Experience
          </button>

          {/* Education */}
          <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Education</h3>
          {form.education.map((edu, index) => (
            <div key={index} style={sectionBoxStyle}>
              {form.education.length > 1 && (
                <button type="button" style={removeBtnStyle} onClick={() => removeItem("education", index)}>
                  Remove
                </button>
              )}
              <div className="auth-field">
                <label>Degree</label>
                <input value={edu.degree || ""} onChange={(e) => handleListChange("education", index, "degree", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Institution</label>
                <input value={edu.institution || ""} onChange={(e) => handleListChange("education", index, "institution", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Year</label>
                <input value={edu.year || ""} onChange={(e) => handleListChange("education", index, "year", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => addItem("education", emptyEducation)}>
            + Add Education
          </button>

          {/* Skills */}
          <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Skills</h3>
          {form.skills.map((skill, index) => (
            <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                placeholder="e.g. Python"
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
              {form.skills.length > 1 && (
                <button type="button" style={{ ...removeBtnStyle, position: "static" }} onClick={() => removeSkill(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={addSkill}>
            + Add Skill
          </button>

          {/* Projects */}
          <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Projects</h3>
          {form.projects.map((proj, index) => (
            <div key={index} style={sectionBoxStyle}>
              {form.projects.length > 1 && (
                <button type="button" style={removeBtnStyle} onClick={() => removeItem("projects", index)}>
                  Remove
                </button>
              )}
              <div className="auth-field">
                <label>Project Title</label>
                <input value={proj.title || ""} onChange={(e) => handleListChange("projects", index, "title", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Description</label>
                <textarea value={proj.description || ""} onChange={(e) => handleListChange("projects", index, "description", e.target.value)} rows={2} style={textareaStyle} />
              </div>
              <div className="auth-field">
                <label>Link</label>
                <input value={proj.link || ""} onChange={(e) => handleListChange("projects", index, "link", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => addItem("projects", emptyProject)}>
            + Add Project
          </button>

          {/* Certifications */}
          <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Certifications</h3>
          {form.certifications.map((cert, index) => (
            <div key={index} style={sectionBoxStyle}>
              {form.certifications.length > 1 && (
                <button type="button" style={removeBtnStyle} onClick={() => removeItem("certifications", index)}>
                  Remove
                </button>
              )}
              <div className="auth-field">
                <label>Certification Name</label>
                <input value={cert.name || ""} onChange={(e) => handleListChange("certifications", index, "name", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Issuer</label>
                <input value={cert.issuer || ""} onChange={(e) => handleListChange("certifications", index, "issuer", e.target.value)} />
              </div>
              <div className="auth-field">
                <label>Year</label>
                <input value={cert.year || ""} onChange={(e) => handleListChange("certifications", index, "year", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => addItem("certifications", emptyCertification)}>
            + Add Certification
          </button>

          {/* Links */}
          <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Links</h3>
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