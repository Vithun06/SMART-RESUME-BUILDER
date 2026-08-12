 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    {
      icon: "👤",
      title: "Profile",
      description: "Manage your personal information",
      path: "/profile",
    },
    {
      icon: "📊",
      title: "Dashboard",
      description: "View your resume activity and analytics",
      path: "/dashboard",
    },
    {
      icon: "📂",
      title: "My Resumes",
      description: "View and manage your saved resumes",
      path: "/my-resumes",
    },
    {
      icon: "📥",
      title: "Download History",
      description: "Check your previous resume downloads",
      path: "/download-history",
    },
    {
      icon: "💬",
      title: "Feedback",
      description: "Share your experience and suggestions",
      path: "/feedback",
    },
    {
      icon: "📞",
      title: "Contact Us",
      description: "Get help or contact the developer",
      path: "/contact",
    },
  ];

  return (
    <div className="settings-page">

      {/* HERO HEADER */}
      <section className="settings-hero">

        <div className="settings-hero-icon">
          ⚙️
        </div>

        <div>
          <span className="settings-eyebrow">
            SMART RESUME BUILDER
          </span>

          <h1>Settings</h1>

          <p>
            Manage your account, preferences and resume
            workspace from one place.
          </p>
        </div>

      </section>


      {/* MAIN SETTINGS */}
      <main className="settings-content">

        {/* ACCOUNT & APP */}
        <section className="settings-section">

          <div className="settings-section-heading">
            <div>
              <h2>Account & Workspace</h2>
              <p>
                Everything you need to manage your
                Smart Resume Builder account.
              </p>
            </div>
          </div>


          <div className="settings-grid">

            {navigationItems.map((item) => (
              <button
                key={item.path}
                className="settings-card"
                onClick={() => navigate(item.path)}
              >

                <div className="settings-card-icon">
                  {item.icon}
                </div>

                <div className="settings-card-content">

                  <h3>{item.title}</h3>

                  <p>
                    {item.description}
                  </p>

                </div>

                <span className="settings-card-arrow">
                  →
                </span>

              </button>
            ))}

          </div>

        </section>


        {/* APPEARANCE */}
        <section className="settings-section">

          <div className="settings-section-heading">
            <div>
              <h2>Appearance</h2>

              <p>
                Customize how Smart Resume Builder
                looks on your device.
              </p>
            </div>
          </div>


          <div className="appearance-card">

            <div className="appearance-info">

              <div className="appearance-icon">
                {theme === "light" ? "☀️" : "🌙"}
              </div>

              <div>
                <h3>Theme</h3>

                <p>
                  Choose your preferred interface
                  appearance.
                </p>
              </div>

            </div>


            <div className="theme-switcher">

              <button
                className={
                  theme === "light"
                    ? "theme-option active"
                    : "theme-option"
                }
                onClick={() => setTheme("light")}
              >
                ☀️
                <span>Light</span>
              </button>


              <button
                className={
                  theme === "dark"
                    ? "theme-option active"
                    : "theme-option"
                }
                onClick={() => setTheme("dark")}
              >
                🌙
                <span>Dark</span>
              </button>

            </div>

          </div>

        </section>


        {/* QUICK ACTIONS */}
        <section className="settings-section">

          <div className="settings-section-heading">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Quickly return to the main areas of
                your resume workspace.
              </p>
            </div>
          </div>


          <div className="quick-actions">

            <button
              onClick={() => navigate("/resume")}
              className="quick-action primary"
            >
              <span>✨</span>
              <div>
                <strong>Create New Resume</strong>
                <small>
                  Start building a new resume
                </small>
              </div>
              <b>→</b>
            </button>


            <button
              onClick={() => navigate("/")}
              className="quick-action"
            >
              <span>🏠</span>
              <div>
                <strong>Back to Home</strong>
                <small>
                  Return to the main website
                </small>
              </div>
              <b>→</b>
            </button>

          </div>

        </section>


        {/* DANGER / LOGOUT */}
        <section className="logout-section">

          <div>

            <h3>Sign out of your account</h3>

            <p>
              You can safely sign out of Smart Resume
              Builder from here.
            </p>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </section>

      </main>


      {/* FOOTER NOTE */}
      <div className="settings-footer">

        <span>Smart Resume Builder</span>

        <span>•</span>

        <span>All your workspace settings in one place.</span>

      </div>

    </div>
  );
}

export default Settings;