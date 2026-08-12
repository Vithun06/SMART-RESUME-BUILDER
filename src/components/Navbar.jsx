import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { auth } from "../services/firebase";
import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* =====================================================
     AUTHENTICATION STATE
  ===================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =====================================================
     BUILD RESUME
  ===================================================== */

  const handleResumeClick = () => {
    setMenuOpen(false);

    if (user) {
      navigate("/resume");
    } else {
      alert("Please Login First");
      navigate("/login");
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setMenuOpen(false);

      alert("Logout Successful");

      navigate("/login");
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );
    }
  };

  /* =====================================================
     CLOSE MENU
  ===================================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* =====================================================
     USER INITIAL
  ===================================================== */

  const getUserInitial = () => {
    if (!user?.email) return "U";

    return user.email
      .charAt(0)
      .toUpperCase();
  };

  return (
    <header className="navbar-header">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <div className="navbar-container">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="nav-logo"
          onClick={closeMenu}
        >
          <span className="nav-logo-icon">
            📄
          </span>

          <span className="nav-logo-text">
            Smart
            <span>Resume</span>
          </span>
        </Link>

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          className={`mobile-menu-button ${
            menuOpen ? "active" : ""
          }`}
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className={`navbar-container-inner ${
            menuOpen ? "mobile-open" : ""
          }`}
        >

          <div className="nav-links">

            {/* HOME */}

            <Link
              to="/"
              onClick={closeMenu}
            >
              <span className="nav-link-icon">
                🏠
              </span>
              Home
            </Link>

            {/* =================================================
                LOGGED IN USER
            ================================================= */}

            {user && (
              <>

                {/* DASHBOARD */}

                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  <span className="nav-link-icon">
                    📊
                  </span>
                  Dashboard
                </Link>

                {/* AI COVER LETTER */}

                <Link
                  to="/cover-letter"
                  onClick={closeMenu}
                >
                  <span className="nav-link-icon">
                    ✨
                  </span>
                  AI Cover Letter
                </Link>

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={closeMenu}
                >
                  <span className="nav-link-icon">
                    👤
                  </span>
                  Profile
                </Link>

                {/* BUILD RESUME */}

                <button
                  onClick={
                    handleResumeClick
                  }
                  className="btn-build"
                >
                  <span>＋</span>
                  Build Resume
                </button>

                {/* LOGOUT */}

                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  <span>↪</span>
                  Logout
                </button>

              </>
            )}

            {/* =================================================
                LOGGED OUT USER
            ================================================= */}

            {!user && (
              <>

                <Link
                  to="/login"
                  className="nav-auth-link"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="btn-signup"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>

              </>
            )}

            {/* ABOUT */}

            <Link
              to="/about"
              onClick={closeMenu}
            >
              <span className="nav-link-icon">
                ℹ️
              </span>
              About
            </Link>

          </div>

        </nav>

        {/* =================================================
            USER PROFILE BADGE
        ================================================= */}

        {user && (
          <div
            className="navbar-user-area"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >

            <div className="navbar-user-avatar">
              {getUserInitial()}
            </div>

            <div className="navbar-user-info">
              <span className="navbar-user-label">
                Signed in as
              </span>

              <strong>
                {user.email}
              </strong>
            </div>

            <span className="navbar-user-arrow">
              ▾
            </span>

          </div>
        )}

      </div>

      {/* =================================================
          USER STATUS
      ================================================= */}

      {user && (
        <div className="user-status-bar">

          <span className="status-dot"></span>

          <span>
            Account active
          </span>

          <span className="status-divider">
            •
          </span>

          <strong>
            {user.email}
          </strong>

        </div>
      )}

    </header>
  );
}

export default Navbar;