import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    console.log("Contact Message:", formData);

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      <div className="contact-background-glow contact-glow-one"></div>
      <div className="contact-background-glow contact-glow-two"></div>

      <main className="contact-container">

        {/* Header */}
        <section className="contact-hero">
          <span className="contact-eyebrow">
            ✦ SMART RESUME BUILDER
          </span>

          <h1>
            Let's
            <span> Connect.</span>
          </h1>

          <p>
            Have a question, suggestion, or need help with
            your resume? Send us a message and we'll be happy
            to hear from you.
          </p>
        </section>

        {/* Main Content */}
        <section className="contact-content">

          {/* Contact Information */}
          <div className="contact-info-card">

            <div className="contact-info-icon">
              💬
            </div>

            <h2>Get in Touch</h2>

            <p className="contact-info-description">
              We're always open to feedback, suggestions,
              and ideas that can make Smart Resume Builder better.
            </p>

            <div className="contact-details">

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  👤
                </div>

                <div>
                  <span>Developer</span>
                  <strong>Vithun T R</strong>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  📄
                </div>

                <div>
                  <span>Application</span>
                  <strong>Smart Resume Builder</strong>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon">
                  ⚡
                </div>

                <div>
                  <span>Purpose</span>
                  <strong>Resume & Career Assistance</strong>
                </div>
              </div>

            </div>

            <div className="contact-info-footer">
              <span>✦</span>
              Thank you for using Smart Resume Builder.
            </div>

          </div>

          {/* Contact Form */}
          <div className="contact-form-card">

            <div className="contact-form-header">
              <span>CONTACT FORM</span>

              <h2>Send us a message</h2>

              <p>
                Fill out the form below and let us know
                how we can help.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="contact-form-row">

                <div className="contact-form-group">
                  <label htmlFor="name">
                    Your Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="contact-form-group">
                <label htmlFor="message">
                  Your Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="7"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="contact-submit-btn"
              >
                <span>Send Message</span>
                <span className="contact-submit-arrow">
                  →
                </span>
              </button>

            </form>

            {submitted && (
              <div className="contact-success">
                <span>✓</span>

                <div>
                  <strong>Message submitted!</strong>
                  <p>
                    Thank you for reaching out to us.
                  </p>
                </div>
              </div>
            )}

          </div>

        </section>

        {/* Bottom Note */}
        <div className="contact-bottom-note">
          <span>✦</span>
          Built to help you build your career.
          <span>✦</span>
        </div>

      </main>
    </div>
  );
}

export default Contact;