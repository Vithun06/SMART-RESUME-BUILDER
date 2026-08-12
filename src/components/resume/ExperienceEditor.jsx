import React from "react";
import "./ExperienceEditor.css";

function ExperienceEditor({
  experience = [],
  setExperience,
}) {
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now(),
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experience];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setExperience(updated);
  };

  const removeExperience = (index) => {
    const updated = experience.filter(
      (_, i) => i !== index
    );

    setExperience(updated);
  };

  return (
    <section className="experience-editor">
      {/* Header */}
      <div className="experience-editor-header">
        <div>
          <span className="editor-eyebrow">
            CAREER
          </span>

          <h3>
            💼 Work Experience
          </h3>

          <p>
            Add your professional experience, internships,
            and important roles.
          </p>
        </div>

        <span className="experience-count">
          {experience.length}
        </span>
      </div>

      {/* Experience Cards */}
      <div className="experience-list">
        {experience.map((exp, index) => (
          <div
            className="experience-card"
            key={exp.id || index}
          >
            {/* Card Header */}
            <div className="experience-card-header">
              <div className="experience-card-title">
                <span className="experience-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h4>
                    Experience {index + 1}
                  </h4>

                  <span>
                    Professional / Internship Experience
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="experience-remove-btn"
                onClick={() => removeExperience(index)}
                title="Remove experience"
              >
                🗑️
              </button>
            </div>

            {/* Company + Role */}
            <div className="experience-form-grid">
              <div className="experience-field">
                <label>Company Name</label>

                <input
                  type="text"
                  placeholder="e.g. TCS"
                  value={exp.company || ""}
                  onChange={(e) =>
                    updateExperience(
                      index,
                      "company",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="experience-field">
                <label>Job Role</label>

                <input
                  type="text"
                  placeholder="e.g. Java Developer Intern"
                  value={exp.role || ""}
                  onChange={(e) =>
                    updateExperience(
                      index,
                      "role",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div className="experience-field">
              <label>Location</label>

              <input
                type="text"
                placeholder="e.g. Chennai, India"
                value={exp.location || ""}
                onChange={(e) =>
                  updateExperience(
                    index,
                    "location",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Dates */}
            <div className="experience-form-grid">
              <div className="experience-field">
                <label>Start Date</label>

                <input
                  type="month"
                  value={exp.startDate || ""}
                  onChange={(e) =>
                    updateExperience(
                      index,
                      "startDate",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="experience-field">
                <label>End Date</label>

                <input
                  type="month"
                  value={exp.endDate || ""}
                  onChange={(e) =>
                    updateExperience(
                      index,
                      "endDate",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div className="experience-field">
              <div className="description-label-row">
                <label>Responsibilities & Achievements</label>

                <span>
                  Keep it concise
                </span>
              </div>

              <textarea
                placeholder="Describe your responsibilities, achievements, technologies used, and measurable results..."
                value={exp.description || ""}
                onChange={(e) =>
                  updateExperience(
                    index,
                    "description",
                    e.target.value
                  )
                }
                rows="5"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {experience.length === 0 && (
        <div className="experience-empty">
          <div className="experience-empty-icon">
            💼
          </div>

          <h4>
            No experience added yet
          </h4>

          <p>
            Add your internship, work experience,
            or professional role.
          </p>
        </div>
      )}

      {/* Add Button */}
      <button
        type="button"
        className="experience-add-btn"
        onClick={addExperience}
      >
        <span>＋</span>
        Add Experience
      </button>
    </section>
  );
}

export default ExperienceEditor;