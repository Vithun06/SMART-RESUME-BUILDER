import React, { memo } from "react";

const SkillsSection = memo(({ skills }) => (
  <div className="resume-section">
    <h3>SKILLS</h3>
    <p>{skills?.join(" • ")}</p>
  </div>
));

export default SkillsSection;