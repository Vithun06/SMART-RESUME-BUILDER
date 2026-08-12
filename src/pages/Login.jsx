import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../services/firebase";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      alert("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      let message = "Unable to login. Please try again.";

      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        message =
          "Too many failed attempts. Please try again later.";
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      alert(
        "Password reset email has been sent. Please check your inbox."
      );
    } catch (error) {
      console.error(
        "Password Reset Error:",
        error
      );

      if (error.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert(
          "Unable to send password reset email."
        );
      }
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            ✦
          </div>

          <div>
            <h2>Smart Resume</h2>
            <span>Builder</span>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome back 👋</h1>

          <p>
            Sign in to continue building your
            professional resume.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="login-field">

            <label htmlFor="login-email">
              Email Address
            </label>

            <div className="login-input-wrapper">
              <span className="login-input-icon">
                ✉
              </span>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />
            </div>

          </div>

          {/* Password */}
          <div className="login-field">

            <div className="login-label-row">
              <label htmlFor="login-password">
                Password
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <div className="login-input-wrapper">
              <span className="login-input-icon">
                🔒
              </span>

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span>→</span>
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>New to Smart Resume Builder?</span>
        </div>

        {/* Signup */}
        <button
          type="button"
          className="signup-button"
          onClick={() =>
            navigate("/signup")
          }
        >
          Create an Account
        </button>

        {/* Back Home */}
        <button
          type="button"
          className="back-home-button"
          onClick={() =>
            navigate("/")
          }
        >
          ← Back to Home
        </button>

        {/* Footer */}
        <p className="login-footer">
          Secure authentication powered by Firebase
        </p>

      </div>
    </div>
  );
}

export default Login;