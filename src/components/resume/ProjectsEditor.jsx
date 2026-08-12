import React from "react";
import "./ProjectsEditor.css";

function ProjectsEditor({ projects = [], setProjects }) {
  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now(),
        title: "",
        techStack: "",
        description: "",
      },
    ]);
  };

  const updateProject = (index, field, value) => {
    const updatedProjects = [...projects];

    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value,
    };

    setProjects(updatedProjects);
  };

  const deleteProject = (index) => {
    const updatedProjects = projects.filter(
      (_, projectIndex) => projectIndex !== index
    );

    setProjects(updatedProjects);
  };

  return (
    <section className="projects-editor">
      {/* Header */}
      <div className="projects-editor-header">
        <div className="projects-title-area">
          <div className="projects-icon">🚀</div>

          <div>
            <h3>Projects</h3>
            <p>
              Showcase your best projects, technologies and achievements.
            </p>
          </div>
        </div>

        <div className="project-count">
          {projects.length}{" "}
          {projects.length === 1 ? "Project" : "Projects"}
        </div>
      </div>

      {/* Project Cards */}
      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="projects-empty">
            <div className="empty-icon">📁</div>

            <h4>No projects added yet</h4>

            <p>
              Add your academic, personal or professional projects
              to make your resume stronger.
            </p>

            <button
              type="button"
              className="add-project-btn empty-add-btn"
              onClick={addProject}
            >
              <span>＋</span>
              Add Your First Project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <div className="project-editor-card" key={project.id}>
              {/* Card Header */}
              <div className="project-card-header">
                <div className="project-number">
                  <span>{String(index + 1).padStart(2, "0")}</span>

                  <div>
                    <strong>
                      {project.title?.trim() ||
                        `Project ${index + 1}`}
                    </strong>

                    <small>Resume Project</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="delete-project-btn"
                  onClick={() => deleteProject(index)}
                  title="Delete Project"
                  aria-label={`Delete Project ${index + 1}`}
                >
                  🗑️
                </button>
              </div>

              {/* Inputs */}
              <div className="project-form-grid">
                {/* Project Title */}
                <div className="project-field full-width">
                  <label htmlFor={`project-title-${project.id}`}>
                    Project Title
                  </label>

                  <div className="input-wrapper">
                    <span className="field-icon">✦</span>

                    <input
                      id={`project-title-${project.id}`}
                      type="text"
                      placeholder="e.g. Smart Resume Builder"
                      value={project.title || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="project-field full-width">
                  <label htmlFor={`project-tech-${project.id}`}>
                    Technologies / Tech Stack
                  </label>

                  <div className="input-wrapper">
                    <span className="field-icon">⚡</span>

                    <input
                      id={`project-tech-${project.id}`}
                      type="text"
                      placeholder="e.g. React, JavaScript, Firebase"
                      value={project.techStack || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "techStack",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <span className="field-hint">
                    Separate technologies using commas.
                  </span>
                </div>

                {/* Description */}
                <div className="project-field full-width">
                  <label htmlFor={`project-description-${project.id}`}>
                    Project Description
                  </label>

                  <div className="textarea-wrapper">
                    <span className="field-icon textarea-icon">
                      📝
                    </span>

                    <textarea
                      id={`project-description-${project.id}`}
                      placeholder="Describe what you built, the problem you solved and the main features..."
                      value={project.description || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={5}
                    />
                  </div>

                  <div className="description-footer">
                    <span>
                      Keep it concise and achievement-focused.
                    </span>

                    <span>
                      {(project.description || "").length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Another Project */}
      {projects.length > 0 && (
        <button
          type="button"
          className="add-project-btn"
          onClick={addProject}
        >
          <span>＋</span>
          Add Another Project
        </button>
      )}

      {/* Bottom Tip */}
      {projects.length > 0 && (
        <div className="projects-tip">
          <span>💡</span>

          <div>
            <strong>Resume Tip</strong>

            <p>
              Highlight projects that demonstrate your technical
              skills and include measurable results whenever possible.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProjectsEditor;