import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="premium-footer">

      {/* Top Gradient Line */}
      <div className="footer-glow-line"></div>

      <div className="footer-container">

        {/* Brand Section */}
        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">📄</span>

            <span>
              Smart <strong>Resume Builder</strong>
            </span>
          </Link>

          <p className="footer-description">
            Build professional, ATS-friendly resumes
            and take your career to the next level.
          </p>

          <div className="footer-tech">
            <span>⚛️ React</span>
            <span>⚡ Vite</span>
            <span>🔥 Firebase</span>
          </div>

        </div>


        {/* Quick Links */}
        <div className="footer-section">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

        </div>


        {/* Resume Tools */}
        <div className="footer-section">

          <h3>Resume Tools</h3>

          <Link to="/resume">Build Resume</Link>
          <Link to="/my-resumes">My Resumes</Link>
          <Link to="/cover-letter">
            AI Cover Letter
          </Link>
          <Link to="/download-history">
            Download History
          </Link>

        </div>


        {/* Support */}
        <div className="footer-section">

          <h3>Support</h3>

          <Link to="/feedback">Feedback</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/profile">Profile</Link>

          <Link to="/contact">
            Contact Us
          </Link>

        </div>

      </div>


      {/* Bottom Section */}
      <div className="footer-bottom">

        <p>
          © 2026 <strong>Smart Resume Builder</strong>.
          All rights reserved.
        </p>

        <p className="footer-built">
          Built with
          <span> ♥ </span>
          using React + Vite
        </p>

      </div>

    </footer>
  );
}

export default Footer;