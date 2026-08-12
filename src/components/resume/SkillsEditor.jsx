import React, { useState } from "react";

function SkillsEditor({ skills = [], setSkills }) {
  const [skill, setSkill] = useState("");

  const addSkill = () => {
    if (!skill.trim()) return;

    setSkills([...skills, skill]);
    setSkill("");
  };

  return (
    <div>
      <h3>Skills Editor</h3>

      <input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Enter Skill"
      />

      <button onClick={addSkill}>
        Add Skill
      </button>
    </div>
  );
}

export default SkillsEditor;