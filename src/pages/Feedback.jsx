import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import "./Feedback.css";

function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!auth.currentUser) {
      alert("Please login to submit your feedback.");
      return;
    }

    if (!feedback.trim()) {
      alert("Please enter your feedback.");
      return;
    }

    try {
      setSubmitting(true);

      await addDoc(collection(db, "feedbacks"), {
        userEmail: auth.currentUser.email,
        userId: auth.currentUser.uid,
        rating: Number(rating),
        feedback: feedback.trim(),
        createdAt: new Date(),
      });

      alert("Feedback submitted successfully! Thank you ❤️");

      setFeedback("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">

      <div className="feedback-background-glow feedback-glow-one"></div>
      <div className="feedback-background-glow feedback-glow-two"></div>

      <div className="feedback-card">

        {/* Header */}
        <div className="feedback-header">

          <div className="feedback-icon">
            💬
          </div>

          <div>
            <span className="feedback-label">
              YOUR VOICE MATTERS
            </span>

            <h1>Share Your Feedback</h1>

            <p>
              Help us improve Smart Resume Builder
              with your valuable thoughts.
            </p>
          </div>

        </div>

        {/* Rating */}
        <div className="feedback-section">

          <label className="feedback-field-label">
            How would you rate your experience?
          </label>

          <div className="rating-container">

            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${
                  star <= rating ? "active" : ""
                }`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} out of 5`}
              >
                ★
              </button>
            ))}

          </div>

          <div className="rating-text">
            {rating === 5 && "Excellent experience! 🤩"}
            {rating === 4 && "Great experience! 😊"}
            {rating === 3 && "Good experience. 🙂"}
            {rating === 2 && "Needs improvement. 😐"}
            {rating === 1 && "We'll work to improve. 😔"}
          </div>

        </div>

        {/* Feedback */}
        <div className="feedback-section">

          <label
            htmlFor="feedback-message"
            className="feedback-field-label"
          >
            Your feedback
          </label>

          <div className="feedback-textarea-wrapper">

            <textarea
              id="feedback-message"
              placeholder="Tell us what you think about Smart Resume Builder..."
              value={feedback}
              maxLength={1000}
              onChange={(e) =>
                setFeedback(e.target.value)
              }
            />

            <span className="character-count">
              {feedback.length}/1000
            </span>

          </div>

        </div>

        {/* Submit */}
        <button
          className="feedback-submit-btn"
          onClick={submitFeedback}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="feedback-spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              Submit Feedback
              <span>→</span>
            </>
          )}
        </button>

        <p className="feedback-footer-text">
          🔒 Your feedback is securely stored and helps
          us make the platform better.
        </p>

      </div>

    </div>
  );
}

export default Feedback;