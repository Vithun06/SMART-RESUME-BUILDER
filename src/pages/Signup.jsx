import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      alert("Signup Successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup Error:", error);

      let message = "Unable to create your account.";

      if (error.code === "auth/email-already-in-use") {
        message =
          "An account already exists with this email.";
      } else if (error.code === "auth/invalid-email") {
        message =
          "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        message =
          "Password is too weak. Use at least 6 characters.";
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      {/* Background decoration */}
      <div className="signup-glow signup-glow-one"></div>
      <div className="signup-glow signup-glow-two"></div>

      <div className="signup-card">

        {/* Brand */}
        <div className="signup-brand">

          <div className="signup-logo">
            ✦
          </div>

          <div>
            <h2>Smart Resume</h2>
            <span>Builder</span>
          </div>

        </div>

        {/* Heading */}
        <div className="signup-heading">
          <h1>Create your account 🚀</h1>

          <p>
            Start building professional resumes
            with Smart Resume Builder.
          </p>
        </div>

        <form onSubmit={handleSignup}>

          {/* Email */}
          <div className="signup-field">

            <label htmlFor="signup-email">
              Email Address
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                ✉
              </span>

              <input
                id="signup-email"
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
          <div className="signup-field">

            <label htmlFor="signup-password">
              Password
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                🔒
              </span>

              <input
                id="signup-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>

            <small className="signup-hint">
              Minimum 6 characters
            </small>

          </div>

          {/* Confirm Password */}
          <div className="signup-field">

            <label htmlFor="signup-confirm-password">
              Confirm Password
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                🔐
              </span>

              <input
                id="signup-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="signup-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="signup-spinner"></span>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span>→</span>
              </>
            )}
          </button>

        </form>

        {/* Login */}
        <div className="signup-login-section">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Sign In
          </button>

        </div>

        {/* Back Home */}
        <button
          type="button"
          className="signup-back-home"
          onClick={() =>
            navigate("/")
          }
        >
          ← Back to Home
        </button>

        <p className="signup-footer">
          Secure account creation powered by Firebase
        </p>

      </div>
    </div>
  );
}

export default Signup;