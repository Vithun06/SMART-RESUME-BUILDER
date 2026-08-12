import React, { memo } from "react";

const ProjectsSection = memo(({ projects }) => (
  <div className="resume-section">
    <h3>PROJECTS</h3>

    {projects?.map((project) => (
      <div key={project.id}>
        <strong>{project.title}</strong>
        <p>{project.techStack}</p>
        <p>{project.description}</p>
      </div>
    ))}
  </div>
));

export default ProjectsSection;