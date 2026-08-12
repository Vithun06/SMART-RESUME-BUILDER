import React, { memo } from "react";
import "./CertificationsSection.css";

const CertificationsSection = memo(({ certifications = [] }) => {
  // Remove empty certifications
  const validCertifications = certifications.filter(
    (cert) => cert?.title?.trim()
  );

  // Don't show the section if there are no certifications
  if (validCertifications.length === 0) {
    return null;
  }

  return (
    <section className="certifications-section resume-section">
      {/* Section Header */}
      <div className="certifications-section-header">
        <div className="certifications-heading-wrap">
          <span className="certifications-heading-icon">✦</span>

          <div>
            <h3>CERTIFICATIONS</h3>
            <span className="certifications-heading-line"></span>
          </div>
        </div>
      </div>

      {/* Certifications List */}
      <div className="certifications-list">
        {validCertifications.map((cert, index) => (
          <article
            className="certification-item"
            key={cert.id || index}
          >
            {/* Left Accent */}
            <div className="certification-accent"></div>

            {/* Certificate Icon */}
            <div className="certification-icon">
              ✓
            </div>

            {/* Certificate Content */}
            <div className="certification-content">
              <h4>
                {cert.title}
              </h4>

              {cert.year && (
                <div className="certification-meta">
                  <span className="certification-meta-icon">
                    ◷
                  </span>

                  <span>
                    {cert.year}
                  </span>
                </div>
              )}
            </div>

            {/* Certificate Number */}
            <div className="certification-number">
              {String(index + 1).padStart(2, "0")}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});

CertificationsSection.displayName = "CertificationsSection";

export default CertificationsSection;