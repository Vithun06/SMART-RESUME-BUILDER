import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CoverLetter.css";
function CoverLetter() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state || {};

  const firstProject =
    Array.isArray(data.projects) && data.projects.length > 0
      ? data.projects[0]?.projectName
      : "";

  const internshipCompany =
    data.internship?.companyName || "";

  const internshipRole =
    data.internship?.jobRole || "";

  const skills = Array.isArray(data.skills)
    ? data.skills.join(", ")
    : data.skills || "";

  return (
    <div className="cover-letter-page">

      <div className="cover-letter-container">

        {/* Header */}
        <div className="cover-letter-header">
          <div>
            <h1>📄 Cover Letter</h1>
            <p>
              Create a professional cover letter from your resume details.
            </p>
          </div>

          <button
            className="cover-letter-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {/* Cover Letter */}
        <div className="cover-letter-paper">

          <p>Dear Hiring Manager,</p>

          <p>
            I am excited to apply for the position at your organization.
            My name is{" "}
            <strong>
              {data.fullName || "Applicant"}
            </strong>
            , and I have completed my education in{" "}
            <strong>
              {data.education || "my specified field"}
            </strong>
            .
          </p>

          {skills && (
            <p>
              I have developed skills in{" "}
              <strong>{skills}</strong>
              {firstProject && (
                <>
                  {" "}and have worked on projects such as{" "}
                  <strong>{firstProject}</strong>.
                </>
              )}
            </p>
          )}

          {internshipCompany && (
            <p>
              I also completed an internship at{" "}
              <strong>{internshipCompany}</strong>
              {internshipRole && (
                <>
                  {" "}as a{" "}
                  <strong>{internshipRole}</strong>.
                </>
              )}
            </p>
          )}

          <p>
            I believe that my technical knowledge, practical experience,
            willingness to learn, and enthusiasm would allow me to
            contribute positively to your organization.
          </p>

          <p>
            I would welcome the opportunity to discuss my qualifications
            and how my skills can contribute to your team.
          </p>

          <p>
            Thank you for your time and consideration.
          </p>

          <div className="cover-letter-signature">
            <p> Sincerely,</p>

            <strong>
              {data.fullName || "Applicant"}
            </strong>

            {data.email && (
              <span>{data.email}</span>
            )}

            {data.phone && (
              <span>{data.phone}</span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default CoverLetter;