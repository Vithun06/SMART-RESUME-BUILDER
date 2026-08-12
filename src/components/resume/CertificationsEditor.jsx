import React from "react";
import "./CertificationsEditor.css";

function CertificationsEditor({
  certifications = [],
  setCertifications,
}) {
  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: Date.now(),
        title: "",
        organization: "",
        year: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setCertifications(updated);
  };

  const removeCertification = (index) => {
    const updated = certifications.filter(
      (_, i) => i !== index
    );

    setCertifications(updated);
  };

  return (
    <section className="certifications-editor">

      {/* Header */}
      <div className="certifications-header">

        <div>
          <div className="certifications-title-row">
            <span className="certifications-icon">🏆</span>

            <div>
              <h3>Certifications</h3>

              <p>
                Add professional certifications and
                credentials to strengthen your resume.
              </p>
            </div>
          </div>
        </div>

        <span className="certification-count">
          {certifications.length}{" "}
          {certifications.length === 1
            ? "Certificate"
            : "Certificates"}
        </span>

      </div>


      {/* Empty State */}
      {certifications.length === 0 && (
        <div className="certifications-empty">

          <div className="empty-cert-icon">
            🏅
          </div>

          <h4>No certifications added yet</h4>

          <p>
            Add your professional certifications,
            courses, and credentials here.
          </p>

          <button
            type="button"
            className="add-certification-btn"
            onClick={addCertification}
          >
            <span>＋</span>
            Add Certification
          </button>

        </div>
      )}


      {/* Certification Cards */}
      <div className="certifications-list">

        {certifications.map((cert, index) => (
          <div
            className="certification-card"
            key={cert.id || index}
          >

            {/* Card Header */}
            <div className="certification-card-header">

              <div className="certification-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div>
                <h4>
                  Certification {index + 1}
                </h4>

                <span>
                  Professional Credential
                </span>
              </div>

              <button
                type="button"
                className="remove-certification-btn"
                onClick={() => removeCertification(index)}
                title="Remove Certification"
              >
                🗑️
              </button>

            </div>


            {/* Form */}
            <div className="certification-form-grid">

              {/* Certification Name */}
              <div className="certification-field full-width">

                <label>
                  Certification Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Java Programming Certification"
                  value={cert.title || ""}
                  onChange={(e) =>
                    updateCertification(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Organization */}
              <div className="certification-field">

                <label>
                  Issuing Organization
                </label>

                <input
                  type="text"
                  placeholder="e.g. Oracle, Google, Microsoft"
                  value={cert.organization || ""}
                  onChange={(e) =>
                    updateCertification(
                      index,
                      "organization",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Year */}
              <div className="certification-field">

                <label>
                  Issue Year
                </label>

                <input
                  type="text"
                  placeholder="e.g. 2026"
                  value={cert.year || ""}
                  onChange={(e) =>
                    updateCertification(
                      index,
                      "year",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Credential ID */}
              <div className="certification-field">

                <label>
                  Credential ID
                </label>

                <input
                  type="text"
                  placeholder="Optional"
                  value={cert.credentialId || ""}
                  onChange={(e) =>
                    updateCertification(
                      index,
                      "credentialId",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Credential URL */}
              <div className="certification-field">

                <label>
                  Credential URL
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={cert.credentialUrl || ""}
                  onChange={(e) =>
                    updateCertification(
                      index,
                      "credentialUrl",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>
        ))}

      </div>


      {/* Add Another */}
      {certifications.length > 0 && (
        <button
          type="button"
          className="add-another-certification"
          onClick={addCertification}
        >
          <span>＋</span>
          Add Another Certification
        </button>
      )}

    </section>
  );
}

export default CertificationsEditor;