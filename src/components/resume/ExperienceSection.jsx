import React, { memo } from "react";

const ExperienceSection = memo(({ experience }) => (
  <div className="resume-section">
    <h3>WORK EXPERIENCE</h3>

    {experience?.map((exp) => (
      <div key={exp.id}>
        <strong>{exp.role}</strong> - <em>{exp.company}</em>
        <p>{exp.description}</p>
      </div>
    ))}
  </div>
));

export default ExperienceSection;