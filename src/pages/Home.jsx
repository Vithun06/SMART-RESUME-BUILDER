import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import "../components/Home.css";

function Home() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading Smart Resume Builder...</p>
      </div>
    );
  }

  const features = [
    ["⭐", "ATS Friendly", "Create resumes designed to pass ATS screening."],
    ["📋", "Resume Suggestions", "Get smart suggestions to improve your resume."],
    ["📄", "Premium Templates", "Choose modern and professional resume templates."],
    ["📷", "Photo Upload", "Add your profile photo for a professional resume."],
    ["📊", "Resume Score", "Analyze your resume and improve your ATS score."],
    ["☁️", "Cloud Save", "Save and edit your resumes from anywhere."],
    ["📄", "PDF Download", "Download your professional resume as PDF."],
    ["🔗", "Public Share", "Share your resume through a public link."],
    ["✏️", "Resume Editor", "Edit your saved resume whenever you need."],
    ["🌙", "Dark Mode", "Switch between light and dark themes."],
    ["🔒", "Secure Login", "Firebase Authentication protects user access."],
    ["🤖", "AI Cover Letter", "Create professional cover letters with AI."],
    ["📊", "ATS Analytics", "Get detailed ATS analysis and improvement reports."],
    ["🌐", "Portfolio Links", "Add GitHub, LinkedIn and portfolio links."],
    ["📜", "Certifications", "Add certificates with image preview."],
    ["📱", "Mobile Friendly", "Create and edit resumes on any device."],
    ["⚡", "Fast Export", "Generate a high-quality PDF quickly."],
    ["🎯", "Skill Gap Analysis", "Identify missing skills and improvement areas."],
    ["✍️", "Action Verbs", "Improve resume impact with strong action words."],
    ["🏷️", "Industry Keywords", "Use relevant keywords for your target role."],
    ["🛡️", "Data Privacy", "Keep personal resume information protected."],
    ["💼", "Interview Support", "Prepare better with contextual resume guidance."],
  ];

  const advantages = [
    "⭐ ATS Friendly Resume",
    "📋 Smart Resume Suggestions",
    "🤖 AI Cover Letter",
    "📄 Professional PDF Download",
    "📷 Profile Photo Upload",
    "📊 Resume Score",
    "🎨 Multiple Resume Templates",
    "🔗 Public Resume Sharing",
    "✏️ Resume Editing",
    "☁️ Cloud Save",
    "📱 Responsive Design",
    "🌙 Light & Dark Theme",
    "🔒 Firebase Authentication",
    "📊 ATS Analytics Report",
    "🌐 LinkedIn & GitHub Support",
    "📜 Certificate Upload",
    "🎯 Skill Gap Analysis",
    "✍️ Action Verbs",
    "🏷️ Industry Keywords",
    "🛡️ Data Privacy",
  ];

  return (
    <main className="home-container">

      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-badge">
          ✨ Smart • Professional • ATS Ready
        </div>

        <h1 className="home-title">
          Build a Resume That
          <span> Gets Noticed.</span>
        </h1>

        <p className="home-subtitle">
          Create professional, ATS-friendly resumes with smart tools,
          modern templates, analytics, AI assistance and cloud storage.
        </p>

        <div className="hero-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate("/resume")}
          >
            🚀 Build My Resume
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/about")}
          >
            Learn More →
          </button>
        </div>

        <div className="hero-trust">
          <span>✓ ATS Friendly</span>
          <span>✓ Professional Templates</span>
          <span>✓ Cloud Ready</span>
          <span>✓ AI Powered</span>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features-section">
        <div className="section-heading">
          <span className="section-label">POWERFUL TOOLKIT</span>

          <h2 className="section-title">
            Everything You Need
          </h2>

          <p className="section-subtitle">
            One complete platform to build, improve, analyze and manage
            your professional resume.
          </p>
        </div>

        <div className="features-grid">
          {features.map(([icon, title, description], index) => (
            <article
              className="feature-card"
              key={`${title}-${index}`}
            >
              <div className="feature-icon">
                {icon}
              </div>

              <div className="feature-content">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>

              <span className="feature-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="cta-content">
          <span className="cta-label">
            READY WHEN YOU ARE
          </span>

          <h2>
            Turn Your Skills Into
            <span> A Strong Resume.</span>
          </h2>

          <p>
            Build your professional resume and make your first impression count.
          </p>
        </div>

        <div className="cta-buttons">
          <button
            className="cta-primary"
            onClick={() => navigate("/resume")}
          >
            🚀 Create Resume
          </button>

          <button
            className="cta-secondary"
            onClick={() => navigate("/about")}
          >
            Explore Platform
          </button>
        </div>
      </section>

      {/* ================= ACHIEVEMENTS ================= */}
      <section className="achievements-section">
        <div className="section-heading">
          <span className="section-label">
            PLATFORM HIGHLIGHTS
          </span>

          <h2 className="section-title">
            Built With Purpose
          </h2>

          <p className="section-subtitle">
            Designed to combine resume creation, smart analysis and
            professional presentation in one platform.
          </p>
        </div>

        <div className="stats">
          <div className="stat-card">
            <strong>100%</strong>
            <span>Secure Access</span>
          </div>

          <div className="stat-card">
            <strong>98%</strong>
            <span>ATS Focus</span>
          </div>

          <div className="stat-card">
            <strong>24/7</strong>
            <span>Cloud Access</span>
          </div>

          <div className="stat-card">
            <strong>AI</strong>
            <span>Smart Assistance</span>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE ================= */}
      <section className="why-section">
        <div className="section-heading">
          <span className="section-label">
            WHY SMART RESUME BUILDER
          </span>

          <h2 className="section-title">
            More Than Just a Resume Editor
          </h2>

          <p className="section-subtitle">
            A complete resume-building experience designed for students,
            freshers and professionals.
          </p>
        </div>

        <div className="advantages-grid">
          {advantages.map((item, index) => (
            <div
              className="advantage-item"
              key={`${item}-${index}`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ================= QUOTE ================= */}
      <section className="quote-section">
        <div className="quote-mark">“</div>

        <h2>
          Your Resume Is Your First Impression.
        </h2>

        <p>
          Build it professionally. Stand out. Get noticed.
        </p>

        <span>
          — Smart Resume Builder
        </span>
      </section>

      {/* ================= QUICK CONTROLS - MOVED TO BOTTOM ================= */}
      <section className="quick-controls-section">
        <div className="quick-controls-header">
          <span className="control-label">
            PERSONALIZE YOUR EXPERIENCE
          </span>

          <h2>
            ⚡ Quick Controls
          </h2>

          <p>
            Manage your application preferences from one dedicated place.
          </p>
        </div>

        <div className="quick-controls-grid">

          {/* SETTINGS - NOW AT THE BOTTOM */}
          <button
            className="quick-control-card"
            onClick={() => navigate("/settings")}
          >
            <div className="control-icon settings-icon">
              ⚙️
            </div>

            <div>
              <h3>Settings</h3>
              <p>
                Manage your profile and application preferences.
              </p>
            </div>

            <span className="control-arrow">
              →
            </span>
          </button>

          {/* THEME */}
          <button
            className="quick-control-card"
            onClick={() => {
              document.documentElement.classList.toggle("dark");
            }}
          >
            <div className="control-icon theme-icon">
              🌙
            </div>

            <div>
              <h3>Theme</h3>
              <p>
                Switch your preferred visual appearance.
              </p>
            </div>

            <span className="control-arrow">
              →
            </span>
          </button>

        </div>
      </section>

      {/* ================= FINAL ACTION ================= */}
      <section className="final-action">
        <h2>
          Your Next Opportunity Starts Here.
        </h2>

        <p>
          Create a professional resume that represents your skills,
          experience and career goals.
        </p>

        <button
          className="btn-primary final-button"
          onClick={() => navigate("/resume")}
        >
          🚀 Start Building Now
        </button>
      </section>

    </main>
  );
}

export default Home;
