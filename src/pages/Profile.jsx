import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebase";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        setUser(currentUser);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner"></div>

        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.displayName || "User";

  const email =
    user.email || "No email available";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <main className="profile-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="profile-hero">

        <div className="profile-hero-content">

          <span className="profile-badge">
            👤 ACCOUNT PROFILE
          </span>

          <h1>
            Your Profile
          </h1>

          <p>
            Manage your account information
            and personal details.
          </p>

        </div>

      </section>


      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <section className="profile-content">

        <div className="profile-main-card">

          {/* PROFILE HEADER */}

          <div className="profile-card-header">

            <div className="profile-avatar-wrapper">

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar profile-avatar-fallback">
                  {initials}
                </div>
              )}

              <span className="profile-online-dot"></span>

            </div>


            <div className="profile-user-heading">

              <span className="profile-account-label">
                ACCOUNT
              </span>

              <h2>
                {displayName}
              </h2>

              <p>
                {email}
              </p>

            </div>

          </div>


          {/* INFORMATION */}

          <div className="profile-section">

            <div className="profile-section-title">

              <div className="profile-section-icon">
                ℹ️
              </div>

              <div>
                <h3>
                  Personal Information
                </h3>

                <p>
                  Your registered account details
                </p>
              </div>

            </div>


            <div className="profile-info-grid">

              <div className="profile-info-item">

                <span className="profile-info-label">
                  Full Name
                </span>

                <strong>
                  {displayName}
                </strong>

              </div>


              <div className="profile-info-item">

                <span className="profile-info-label">
                  Email Address
                </span>

                <strong>
                  {email}
                </strong>

              </div>


              <div className="profile-info-item">

                <span className="profile-info-label">
                  Authentication
                </span>

                <strong className="profile-auth-status">
                  <span></span>
                  Authenticated
                </strong>

              </div>


              <div className="profile-info-item">

                <span className="profile-info-label">
                  Account Provider
                </span>

                <strong>
                  {user.providerData?.[0]?.providerId ===
                  "google.com"
                    ? "Google"
                    : "Email & Password"}
                </strong>

              </div>

            </div>

          </div>


          {/* SECURITY */}

          <div className="profile-security-card">

            <div className="profile-security-icon">
              🔐
            </div>

            <div>

              <h3>
                Your account is protected
              </h3>

              <p>
                Your profile is connected to your
                authenticated account. Resume data
                is associated with your account.
              </p>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="profile-actions">

            <button
              type="button"
              className="profile-secondary-btn"
              onClick={() =>
                navigate("/settings")
              }
            >
              ⚙️ Account Settings
            </button>


            <button
              type="button"
              className="profile-primary-btn"
              onClick={() =>
                navigate("/my-resumes")
              }
            >
              📄 My Resumes
            </button>

          </div>

        </div>


        {/* =================================================
            QUICK INFO
        ================================================= */}

        <aside className="profile-side-card">

          <div className="profile-side-icon">
            ✨
          </div>

          <h3>
            Build your professional profile
          </h3>

          <p>
            Keep your resume information
            complete and up to date to create
            stronger job applications.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/resume")
            }
          >
            Create Resume
            <span>→</span>
          </button>

        </aside>

      </section>

    </main>
  );
}

export default Profile;