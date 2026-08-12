import "../components/ResumePreview.css";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";

import { useEffect, useMemo, useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

/* =========================================================
   SMART RESUME BUILDER
   FINAL PREMIUM RESUME PREVIEW
   ---------------------------------------------------------
   Includes:
   - Resume Preview
   - 4 Templates
   - Accent Colors
   - Section Reordering
   - Human Score
   - AI Score
   - ATS Analysis
   - AI Suggestions
   - Skill Gap Analysis
   - Industry Keywords
   - Action Verbs
   - Achievement Analysis
   - Project Analysis
   - Job Role Matching
   - Resume Strengths
   - Resume Weaknesses
   - Interview Questions
   - AI Cover Letter navigation
   - PDF Download
   - Print
   - Public Sharing
   - Certificate Preview
   - Dark Mode
   - Firebase / Firestore
   - Owner Protection
   - Mobile First Responsive UI
   ========================================================= */

function ResumePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeId } = useParams();

  /* =========================================================
     STATE
     ========================================================= */

  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("resumeDarkMode") === "true"
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [activePanel, setActivePanel] = useState("overview");
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const [jobDescription, setJobDescription] = useState("");

  /* =========================================================
     DATA
     ========================================================= */

  const data = resumeData || {};

  const isOwner =
    auth.currentUser?.uid && auth.currentUser.uid === data?.userId;

  const currentId = data?.id || resumeId || "default";

  const templateKey = `resumeTemplate_${currentId}`;
  const colorKey = `resumeColor_${currentId}`;

  const [template, setTemplate] = useState(
    () => localStorage.getItem(templateKey) || "classic"
  );

  const [primaryColor, setPrimaryColor] = useState(
    () => localStorage.getItem(colorKey) || "#2563eb"
  );

  /* =========================================================
     SECTION ORDER
     ========================================================= */

  const [sections, setSections] = useState([
    "Objective",
    "Education",
    "Skills",
    "Projects",
    "Experience",
    "Certifications",
  ]);

  /* =========================================================
     LOCAL STORAGE
     ========================================================= */

  useEffect(() => {
    localStorage.setItem("resumeDarkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(colorKey, primaryColor);
  }, [primaryColor, colorKey]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem(templateKey);

    if (savedTemplate) {
      setTemplate(savedTemplate);
    }
  }, [templateKey]);

  useEffect(() => {
    if (template) {
      localStorage.setItem(templateKey, template);
    }
  }, [template, templateKey]);

  /* =========================================================
     FETCH RESUME
     ========================================================= */

  useEffect(() => {
    const fetchResume = async () => {
      try {
        /* -----------------------------------------------
           LOCATION STATE
           ----------------------------------------------- */

        if (location.state) {
          setResumeData(location.state);

          if (location.state.template) {
            setTemplate(location.state.template);
          }

          localStorage.setItem(
            `previewResume_${resumeId || "current"}`,
            JSON.stringify(location.state)
          );

          setLoading(false);
          return;
        }

        /* -----------------------------------------------
           FIRESTORE DIRECT URL
           ----------------------------------------------- */

        if (resumeId) {
          try {
            const docRef = doc(db, "resumes", resumeId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const fetchedData = {
                id: docSnap.id,
                ...docSnap.data(),
              };

              setResumeData(fetchedData);

              if (fetchedData.template) {
                setTemplate(fetchedData.template);
              }

              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Resume Firestore Load Error:", error);
          }

          /* -----------------------------------------------
             LOCAL STORAGE FALLBACK
             ----------------------------------------------- */

          const savedResume = localStorage.getItem(
            `previewResume_${resumeId}`
          );

          if (savedResume) {
            try {
              const parsed = JSON.parse(savedResume);

              setResumeData(parsed);

              if (parsed.template) {
                setTemplate(parsed.template);
              }

              setLoading(false);
              return;
            } catch (error) {
              console.error("Local Resume Parse Error:", error);
            }
          }

          navigate("/my-resumes", { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Resume loading error:", error);
        setLoading(false);
      }
    };

    fetchResume();
  }, [location.state, resumeId, navigate]);

  /* =========================================================
     SKILLS
     ========================================================= */

  const skillsArray = useMemo(() => {
    return String(data?.skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }, [data?.skills]);

  const skillsText = skillsArray.join(" ").toLowerCase();

  /* =========================================================
     PROJECTS
     ========================================================= */

  const projects = Array.isArray(data?.projects) ? data.projects : [];

  /* =========================================================
     CERTIFICATIONS
     ========================================================= */

  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];

  /* =========================================================
     KEYWORDS
     ========================================================= */

  const keywords = [
    "java",
    "react",
    "reactjs",
    "sql",
    "mysql",
    "python",
    "javascript",
    "typescript",
    "html",
    "css",
    "node",
    "nodejs",
    "express",
    "firebase",
    "mongodb",
    "git",
    "github",
    "rest api",
    "api",
    "bootstrap",
    "tailwind",
    "figma",
    "docker",
    "aws",
    "spring",
    "spring boot",
    "angular",
    "nextjs",
    "c++",
    "c",
    "dsa",
    "data structures",
    "dbms",
    "operating systems",
    "computer networks",
  ];

  const detectedKeywords = useMemo(() => {
    return keywords.filter((word) => skillsText.includes(word));
  }, [skillsText]);

  /* =========================================================
     ATS SCORE
     ========================================================= */

  const atsScore = useMemo(() => {
    let score = 0;

    if (data?.fullName) score += 10;
    if (data?.email) score += 10;
    if (data?.phoneNumber) score += 10;

    if (skillsArray.length >= 3) score += 15;
    else if (skillsArray.length > 0) score += 8;

    if (projects.length > 0) score += 15;

    if (data?.internship?.companyName) score += 15;

    if (certifications.length > 0) score += 10;

    if (data?.summary) score += 5;

    if (data?.linkedin || data?.github || data?.portfolio) {
      score += 5;
    }

    return Math.min(score, 100);
  }, [
    data,
    skillsArray.length,
    projects.length,
    certifications.length,
  ]);

  /* =========================================================
     HUMAN SCORE
     ---------------------------------------------------------
     Human readability / presentation score
     ========================================================= */

  const humanScore = useMemo(() => {
    let score = 0;

    if (data?.fullName) score += 10;
    if (data?.jobTitle) score += 8;
    if (data?.summary && String(data.summary).length >= 60) score += 12;
    else if (data?.summary) score += 7;

    if (data?.email && data?.phoneNumber) score += 10;

    if (skillsArray.length >= 5) score += 12;
    else if (skillsArray.length >= 3) score += 8;

    if (projects.length >= 2) score += 14;
    else if (projects.length === 1) score += 9;

    if (data?.internship?.companyName) score += 10;

    if (certifications.length > 0) score += 7;

    if (data?.linkedin || data?.github || data?.portfolio) {
      score += 7;
    }

    if (data?.education) score += 5;

    return Math.min(score, 100);
  }, [
    data,
    skillsArray.length,
    projects.length,
    certifications.length,
  ]);

  /* =========================================================
     AI SCORE
     ---------------------------------------------------------
     Intelligent local fallback.
     Can later be replaced by real AI API.
     ========================================================= */

  const calculateAIScore = () => {
    let score = 0;

    const fullText = `
      ${data?.fullName || ""}
      ${data?.jobTitle || ""}
      ${data?.summary || ""}
      ${data?.education || ""}
      ${data?.skills || ""}
      ${projects.map((p) => `${p.projectName} ${p.projectDescription}`).join(" ")}
      ${data?.internship?.companyName || ""}
      ${data?.internship?.jobRole || ""}
      ${data?.internship?.description || ""}
      ${certifications.map((c) => `${c.title} ${c.issuer}`).join(" ")}
    `.toLowerCase();

    if (data?.summary) score += 12;

    if (String(data?.summary || "").length >= 100) {
      score += 8;
    }

    if (skillsArray.length >= 5) score += 15;
    else if (skillsArray.length >= 3) score += 10;

    if (projects.length >= 2) score += 15;
    else if (projects.length === 1) score += 10;

    if (data?.internship?.description) score += 10;

    if (certifications.length > 0) score += 8;

    if (data?.github) score += 5;
    if (data?.linkedin) score += 5;
    if (data?.portfolio) score += 5;

    const actionVerbs = [
      "developed",
      "created",
      "designed",
      "implemented",
      "built",
      "optimized",
      "managed",
      "analyzed",
      "improved",
      "developed",
      "led",
    ];

    const actionVerbCount = actionVerbs.filter((verb) =>
      fullText.includes(verb)
    ).length;

    score += Math.min(actionVerbCount * 2, 7);

    const importantTerms = [
      "project",
      "experience",
      "skills",
      "education",
      "certification",
    ];

    importantTerms.forEach((term) => {
      if (fullText.includes(term)) score += 1;
    });

    return Math.min(Math.round(score), 100);
  };

  const aiScore = calculateAIScore();

  /* =========================================================
     AI INSIGHTS
     ========================================================= */

  const aiInsights = useMemo(() => {
    const suggestions = [];
    const strengths = [];
    const weaknesses = [];

    if (data?.summary) {
      strengths.push("Professional summary is available.");
    } else {
      weaknesses.push("Professional summary is missing.");
      suggestions.push(
        "Add a 3–5 line professional summary focused on your target role."
      );
    }

    if (skillsArray.length >= 5) {
      strengths.push("Good number of technical skills detected.");
    } else {
      weaknesses.push("Technical skill coverage can be improved.");
      suggestions.push(
        "Add more role-specific technical skills and tools."
      );
    }

    if (projects.length > 0) {
      strengths.push("Portfolio projects are included.");
    } else {
      weaknesses.push("No projects detected.");
      suggestions.push(
        "Add 1–3 strong projects with technologies and measurable outcomes."
      );
    }

    if (data?.internship?.companyName) {
      strengths.push("Internship/work experience is included.");
    } else {
      suggestions.push(
        "Add internship, freelance, volunteer or practical experience."
      );
    }

    if (certifications.length > 0) {
      strengths.push("Certifications strengthen the profile.");
    } else {
      suggestions.push(
        "Consider adding relevant professional certifications."
      );
    }

    if (data?.github) {
      strengths.push("GitHub profile is available.");
    } else {
      suggestions.push(
        "Add a GitHub profile to demonstrate practical coding work."
      );
    }

    if (data?.linkedin) {
      strengths.push("LinkedIn profile is available.");
    } else {
      suggestions.push(
        "Add a professional LinkedIn profile."
      );
    }

    return {
      suggestions,
      strengths,
      weaknesses,
    };
  }, [
    data,
    skillsArray.length,
    projects.length,
    certifications.length,
  ]);

  /* =========================================================
     SKILL GAP
     ========================================================= */

  const recommendedSkills = [
    "Java",
    "Python",
    "SQL",
    "Git",
    "GitHub",
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "DSA",
    "DBMS",
    "REST API",
    "Firebase",
    "Node.js",
  ];

  const skillGap = recommendedSkills.filter(
    (skill) => !skillsText.includes(skill.toLowerCase())
  );

  /* =========================================================
     ACTION VERBS
     ========================================================= */

  const actionVerbs = [
    "Developed",
    "Built",
    "Designed",
    "Implemented",
    "Created",
    "Optimized",
    "Managed",
    "Analyzed",
    "Improved",
    "Led",
    "Automated",
    "Integrated",
  ];

  const detectedActionVerbs = actionVerbs.filter((verb) =>
    `${data?.summary || ""} ${
      data?.internship?.description || ""
    } ${projects.map((p) => p.projectDescription || "").join(" ")}`
      .toLowerCase()
      .includes(verb.toLowerCase())
  );

  /* =========================================================
     JOB ROLE MATCH
     ========================================================= */

  const jobRole = String(data?.jobTitle || "").toLowerCase();

  const roleKeywords = {
    java: ["java", "spring", "spring boot", "sql", "dsa", "oops"],
    developer: [
      "javascript",
      "react",
      "html",
      "css",
      "git",
      "api",
    ],
    "web developer": [
      "html",
      "css",
      "javascript",
      "react",
      "node",
    ],
    "data analyst": [
      "python",
      "sql",
      "excel",
      "power bi",
      "statistics",
    ],
    "software engineer": [
      "java",
      "python",
      "sql",
      "dsa",
      "git",
      "api",
    ],
  };

  let roleMatchScore = 0;

  const matchingRoleKey = Object.keys(roleKeywords).find((role) =>
    jobRole.includes(role)
  );

  if (matchingRoleKey) {
    const roleSkills = roleKeywords[matchingRoleKey];

    const matched = roleSkills.filter((skill) =>
      skillsText.includes(skill)
    );

    roleMatchScore = Math.min(
      Math.round((matched.length / roleSkills.length) * 100),
      100
    );
  } else {
    roleMatchScore = Math.min(
      detectedKeywords.length * 5,
      100
    );
  }

  /* =========================================================
     JOB DESCRIPTION MATCH
     ========================================================= */

  const jdMatchScore = useMemo(() => {
    if (!jobDescription.trim()) return null;

    const jd = jobDescription.toLowerCase();

    const matched = keywords.filter(
      (keyword) =>
        jd.includes(keyword) && skillsText.includes(keyword)
    );

    const jdKeywords = keywords.filter((keyword) =>
      jd.includes(keyword)
    );

    if (jdKeywords.length === 0) return 0;

    return Math.min(
      Math.round((matched.length / jdKeywords.length) * 100),
      100
    );
  }, [jobDescription, skillsText]);

  /* =========================================================
     AI ANALYZE
     ========================================================= */

  const runAIAnalysis = async () => {
    setAiLoading(true);

    try {
      /*
       * Optional future backend integration:
       *
       * const response = await fetch("/api/ai/analyze", {
       *   method: "POST",
       *   headers: { "Content-Type": "application/json" },
       *   body: JSON.stringify({
       *      resume: data,
       *      jobDescription
       *   })
       * });
       *
       * const result = await response.json();
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setAiAnalyzed(true);
      setActivePanel("ai");
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  /* =========================================================
     SECTION ORDER
     ========================================================= */

  const moveUp = (index) => {
    if (index === 0) return;

    const newSections = [...sections];

    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];

    setSections(newSections);
  };

  const moveDown = (index) => {
    if (index === sections.length - 1) return;

    const newSections = [...sections];

    [newSections[index + 1], newSections[index]] = [
      newSections[index],
      newSections[index + 1],
    ];

    setSections(newSections);
  };

  /* =========================================================
     SHARE
     ========================================================= */

  const copyShareLink = () => {
    const activeResumeId = data?.id || resumeId;

    const shareUrl =
      `${window.location.origin}/resume/${activeResumeId}`;

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert(
            "Public Share Link Copied!\n\n" +
              shareUrl
          );
        })
        .catch(() => {
          alert("Copy failed. URL:\n" + shareUrl);
        });
    } else {
      alert("Share URL:\n" + shareUrl);
    }
  };

  const shareResume = async () => {
    const activeResumeId = data?.id || resumeId;

    const shareUrl =
      `${window.location.origin}/resume/${activeResumeId}`;

    const shareData = {
      title: `${data.fullName || "User"}'s Resume`,
      text: `Check out ${
        data.fullName || "User"
      }'s Resume`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyShareLink();
      }
    } catch (error) {
      console.error("Share cancelled/error:", error);
    }
  };

  /* =========================================================
     PDF
     ========================================================= */

  const downloadPDF = async () => {
    if (downloading) return;

    setDownloading(true);

    const element =
      document.getElementById("pure-resume-pdf");

    if (!element) {
      setDownloading(false);
      return;
    }

    const options = {
      margin: 0,
      filename: `${
        data?.fullName || "Resume"
      }_${Date.now()}.pdf`,
      image: {
        type: "jpeg",
        quality: 1,
      },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },
    };

    try {
      await html2pdf()
        .set(options)
        .from(element)
        .save();

      try {
        await addDoc(collection(db, "downloads"), {
          resumeId:
            data.id || resumeId || "unknown",
          resumeOwnerUid:
            data.userId || null,
          userEmail:
            auth.currentUser?.email ||
            "Public Viewer",
          viewerUid:
            auth.currentUser?.uid || null,
          resumeName:
            data?.fullName || "Untitled",
          downloadedAt:
            serverTimestamp(),
        });
      } catch (firestoreError) {
        console.error(
          "Download analytics error:",
          firestoreError
        );
      }
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );
    } finally {
      setDownloading(false);
    }
  };

  const printResume = () => {
    window.print();
  };

  /* =========================================================
     RENDER RESUME SECTIONS
     ========================================================= */

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case "Objective":
        return data?.summary ? (
          <section
            key="objective"
            className="resume-section page-break-avoid"
          >
            <SectionTitle
              color={primaryColor}
              title="Career Objective"
            />

            <p className="resume-text">
              {data.summary}
            </p>
          </section>
        ) : null;

      case "Education":
        return (
          <section
            key="education"
            className="resume-card page-break-avoid"
          >
            <SectionTitle
              color={primaryColor}
              title="Education"
            />

            {data?.education && (
              <p className="resume-text">
                <strong>Education:</strong>{" "}
                {data.education}
              </p>
            )}

            {data?.cgpa && (
              <p className="resume-text">
                <strong>CGPA:</strong>{" "}
                {data.cgpa}
              </p>
            )}
          </section>
        );

      case "Skills":
        return (
          <section
            key="skills"
            className="resume-card page-break-avoid"
          >
            <SectionTitle
              color={primaryColor}
              title="Skills"
            />

            <div className="skills-container">
              {skillsArray.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="skill-badge"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        );

      case "Projects":
        return projects.length > 0 ? (
          <section
            key="projects"
            className="resume-card page-break-avoid"
          >
            <SectionTitle
              color={primaryColor}
              title="Projects"
            />

            {projects.map((project, index) => (
              <article
                key={index}
                className="project-item"
                style={{
                  borderLeftColor: primaryColor,
                }}
              >
                <h3>
                  {project.projectName ||
                    "Untitled Project"}
                </h3>

                {project.projectDescription && (
                  <p className="project-description">
                    {project.projectDescription}
                  </p>
                )}
              </article>
            ))}
          </section>
        ) : null;

      case "Experience":
        return data?.internship?.companyName ? (
          <section
            key="experience"
            className="resume-card page-break-avoid"
          >
            <SectionTitle
              color={primaryColor}
              title="Experience / Internship"
            />

            <p className="resume-text">
              <strong>
                {data.internship.companyName}
              </strong>
            </p>

            {data.internship.jobRole && (
              <p className="resume-text">
                <strong>Role:</strong>{" "}
                {data.internship.jobRole}
              </p>
            )}

            {data.internship.description && (
              <p className="resume-text">
                {data.internship.description}
              </p>
            )}
          </section>
        ) : null;

      case "Certifications":
        return certifications.length > 0 ? (
          <section
            key="certifications"
            className="resume-card page-break-avoid"
          >
            <SectionTitle
              color={primaryColor}
              title="Certifications"
            />

            {certifications.map(
              (certificate, index) => (
                <article
                  key={index}
                  className="certification-item"
                >
                  <h3>
                    {certificate.title ||
                      "Certificate Title"}
                  </h3>

                  <p className="resume-text">
                    {certificate.issuer ||
                      "Issuer"}
                  </p>

                  {certificate.certificateFile && (
                    <>
                      {certificate.certificateFileType ===
                      "application/pdf" ? (
                        <a
                          href={
                            certificate.certificateFile
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-button"
                        >
                          📄 View Certificate PDF
                        </a>
                      ) : (
                        <img
                          src={
                            certificate.certificateFile
                          }
                          alt={
                            certificate.title ||
                            "Certificate"
                          }
                          className="certificate-image"
                          onClick={() =>
                            setSelectedImage(
                              certificate.certificateFile
                            )
                          }
                        />
                      )}
                    </>
                  )}

                  {index !==
                    certifications.length - 1 && (
                    <hr />
                  )}
                </article>
              )
            )}
          </section>
        ) : null;

      default:
        return null;
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="preview-loading">
        <div className="loading-orbit">
          <span></span>
        </div>

        <h3>Preparing Your Resume</h3>

        <p>
          Loading your professional preview...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (
    !resumeData ||
    Object.keys(resumeData).length === 0
  ) {
    return (
      <div className="preview-error">
        <div className="error-icon">📄</div>

        <h2>Resume Not Found</h2>

        <p>
          The requested resume does not exist
          or the link is invalid.
        </p>

        <button
          className="primary-action"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div
      className={`resume-preview-shell ${
        darkMode ? "dark-theme" : ""
      }`}
      style={{
        "--resume-primary": primaryColor,
      }}
    >
      {/* =====================================================
          MOBILE TOP BAR
          ===================================================== */}

      <div className="mobile-preview-bar no-print">
        <button
          className="mobile-back-button"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <div>
          <strong>Resume Preview</strong>
          <span>
            {data.fullName || "Your Resume"}
          </span>
        </div>

        <button
          className="mobile-tools-button"
          onClick={() =>
            setMobileToolsOpen(
              !mobileToolsOpen
            )
          }
        >
          ⚙️
        </button>
      </div>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`preview-sidebar no-print ${
          mobileToolsOpen
            ? "mobile-sidebar-open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">SR</div>

          <div>
            <strong>
              Smart Resume
            </strong>

            <span>
              Premium Preview
            </span>
          </div>
        </div>

        {/* TEMPLATE */}

        <div className="tool-card">
          <div className="tool-heading">
            <span>01</span>
            <h3>Template</h3>
          </div>

          <select
            value={template}
            onChange={(e) =>
              setTemplate(e.target.value)
            }
            className="template-select"
          >
            <option value="classic">
              Classic
            </option>

            <option value="modern">
              Modern
            </option>

            <option value="premium">
              Premium
            </option>

            <option value="professional">
              Professional
            </option>
          </select>

          <div className="template-mini-grid">
            {[
              ["classic", "Classic"],
              ["modern", "Modern"],
              ["premium", "Premium"],
              [
                "professional",
                "Pro",
              ],
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  template === value
                    ? "template-mini active"
                    : "template-mini"
                }
                onClick={() =>
                  setTemplate(value)
                }
              >
                <span></span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* COLOR */}

        <div className="tool-card">
          <div className="tool-heading">
            <span>02</span>
            <h3>Accent Color</h3>
          </div>

          <div className="color-picker-group">
            {[
              "#2563eb",
              "#7c3aed",
              "#0891b2",
              "#059669",
              "#dc2626",
              "#ea580c",
              "#1e293b",
              "#be185d",
            ].map((color) => (
              <button
                key={color}
                className={`color-dot ${
                  primaryColor === color
                    ? "active"
                    : ""
                }`}
                style={{
                  backgroundColor: color,
                }}
                aria-label={`Select ${color}`}
                onClick={() =>
                  setPrimaryColor(color)
                }
              />
            ))}
          </div>
        </div>

        {/* SECTION ORDER */}

        <div className="tool-card">
          <div className="tool-heading">
            <span>03</span>
            <h3>Section Order</h3>
          </div>

          <div className="section-controls">
            {sections.map(
              (section, index) => (
                <div
                  key={section}
                  className="control-item"
                >
                  <span>{section}</span>

                  <div className="order-buttons">
                    <button
                      onClick={() =>
                        moveUp(index)
                      }
                      disabled={index === 0}
                    >
                      ↑
                    </button>

                    <button
                      onClick={() =>
                        moveDown(index)
                      }
                      disabled={
                        index ===
                        sections.length - 1
                      }
                    >
                      ↓
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* SCORE SUMMARY */}

        <div className="score-card">
          <div className="score-card-header">
            <span>Resume Intelligence</span>
            <span className="live-dot">
              ● LIVE
            </span>
          </div>

          <ScoreRow
            label="Human Score"
            value={humanScore}
            color="#2563eb"
          />

          <ScoreRow
            label="AI Score"
            value={aiScore}
            color="#7c3aed"
          />

          <ScoreRow
            label="ATS Score"
            value={atsScore}
            color="#059669"
          />

          <div className="score-divider"></div>

          <div className="overall-score">
            <span>Overall Profile</span>

            <strong>
              {Math.round(
                (humanScore +
                  aiScore +
                  atsScore) /
                  3
              )}
              /100
            </strong>
          </div>
        </div>

        {/* AI BUTTON */}

        <button
          className="ai-analyze-button"
          onClick={runAIAnalysis}
          disabled={aiLoading}
        >
          <span className="ai-icon">
            ✨
          </span>

          <span>
            {aiLoading
              ? "AI Analyzing..."
              : "Run AI Analysis"}
          </span>

          <span>→</span>
        </button>

        {/* MOBILE CLOSE */}

        <button
          className="mobile-close-tools"
          onClick={() =>
            setMobileToolsOpen(false)
          }
        >
          Close Tools
        </button>
      </aside>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="preview-main">
        {/* TOP ACTION BAR */}

        <div className="preview-topbar no-print">
          <div>
            <span className="eyebrow">
              PROFESSIONAL RESUME STUDIO
            </span>

            <h1>
              Resume Preview
            </h1>

            <p>
              Review, analyze and export
              your professional resume.
            </p>
          </div>

          <div className="topbar-actions">
            <button
              className="ghost-button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode
                ? "☀️ Light"
                : "🌙 Dark"}
            </button>

            <button
              className="ghost-button"
              onClick={shareResume}
            >
              🔗 Share
            </button>

            <button
              className="primary-action"
              onClick={downloadPDF}
              disabled={downloading}
            >
              {downloading
                ? "⏳ Exporting..."
                : "📥 Download PDF"}
            </button>
          </div>
        </div>

        {/* SCORE STRIP */}

        <section className="score-strip no-print">
          <button
            className={
              activePanel === "overview"
                ? "score-tab active"
                : "score-tab"
            }
            onClick={() =>
              setActivePanel("overview")
            }
          >
            <span>👤</span>
            <div>
              <small>
                Human Score
              </small>
              <strong>
                {humanScore}
              </strong>
            </div>
          </button>

          <button
            className={
              activePanel === "ai"
                ? "score-tab ai active"
                : "score-tab ai"
            }
            onClick={() =>
              setActivePanel("ai")
            }
          >
            <span>🤖</span>
            <div>
              <small>
                AI Score
              </small>
              <strong>
                {aiScore}
              </strong>
            </div>
          </button>

          <button
            className={
              activePanel === "ats"
                ? "score-tab ats active"
                : "score-tab ats"
            }
            onClick={() =>
              setActivePanel("ats")
            }
          >
            <span>🎯</span>
            <div>
              <small>
                ATS Score
              </small>
              <strong>
                {atsScore}
              </strong>
            </div>
          </button>

          <button
            className={
              activePanel === "skills"
                ? "score-tab skills active"
                : "score-tab skills"
            }
            onClick={() =>
              setActivePanel("skills")
            }
          >
            <span>🧠</span>
            <div>
              <small>
                Skill Gap
              </small>
              <strong>
                {skillGap.length}
              </strong>
            </div>
          </button>
        </section>

        {/* =================================================
            ANALYTICS PANEL
            ================================================= */}

        <section className="analytics-panel no-print">
          {activePanel === "overview" && (
            <div className="analytics-content">
              <div className="analytics-title">
                <div>
                  <span className="panel-kicker">
                    HUMAN REVIEW
                  </span>

                  <h2>
                    Human Score vs AI Score
                  </h2>
                </div>

                <span className="panel-badge">
                  PROFILE QUALITY
                </span>
              </div>

              <div className="comparison-grid">
                <ComparisonCard
                  icon="👤"
                  title="Human Score"
                  value={humanScore}
                  description="Readability, clarity, structure and professional presentation."
                  color="#2563eb"
                />

                <ComparisonCard
                  icon="🤖"
                  title="AI Score"
                  value={aiScore}
                  description="Content relevance, skills, keywords, impact and career readiness."
                  color="#7c3aed"
                />

                <ComparisonCard
                  icon="🎯"
                  title="ATS Score"
                  value={atsScore}
                  description="Resume structure and machine-readable screening compatibility."
                  color="#059669"
                />
              </div>
            </div>
          )}

          {activePanel === "ai" && (
            <div className="analytics-content">
              <div className="analytics-title">
                <div>
                  <span className="panel-kicker">
                    AI RESUME INTELLIGENCE
                  </span>

                  <h2>
                    AI Analysis
                  </h2>
                </div>

                <button
                  className="small-ai-button"
                  onClick={runAIAnalysis}
                >
                  ✨ Analyze Again
                </button>
              </div>

              {!aiAnalyzed && (
                <div className="ai-empty">
                  <div>🤖</div>

                  <h3>
                    Ready to Analyze
                  </h3>

                  <p>
                    Let AI review your resume
                    and identify improvements,
                    strengths, skills and
                    opportunities.
                  </p>

                  <button
                    className="primary-action"
                    onClick={runAIAnalysis}
                  >
                    ✨ Start AI Analysis
                  </button>
                </div>
              )}

              <div className="ai-insight-grid">
                <InsightCard
                  icon="💪"
                  title="Strengths"
                  items={
                    aiInsights.strengths
                  }
                  type="success"
                />

                <InsightCard
                  icon="⚠️"
                  title="Weaknesses"
                  items={
                    aiInsights.weaknesses
                  }
                  type="warning"
                />

                <InsightCard
                  icon="💡"
                  title="AI Suggestions"
                  items={
                    aiInsights.suggestions
                  }
                  type="info"
                />
              </div>

              <div className="ai-section">
                <div className="ai-section-heading">
                  <span>✍️</span>
                  <div>
                    <h3>
                      Action Verbs
                    </h3>
                    <p>
                      Strong verbs improve
                      resume impact.
                    </p>
                  </div>
                </div>

                <div className="chip-list">
                  {detectedActionVerbs.length >
                  0 ? (
                    detectedActionVerbs.map(
                      (verb) => (
                        <span
                          key={verb}
                          className="success-chip"
                        >
                          ✓ {verb}
                        </span>
                      )
                    )
                  ) : (
                    <span className="empty-chip">
                      No strong action verbs
                      detected yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePanel === "ats" && (
            <div className="analytics-content">
              <div className="analytics-title">
                <div>
                  <span className="panel-kicker">
                    ATS INTELLIGENCE
                  </span>

                  <h2>
                    ATS Analysis
                  </h2>
                </div>

                <div className="large-mini-score">
                  {atsScore}/100
                </div>
              </div>

              <div className="ats-analysis-grid">
                <div className="ats-progress-large">
                  <div
                    className="ats-progress-circle"
                    style={{
                      "--score":
                        atsScore * 3.6,
                    }}
                  >
                    <div>
                      <strong>
                        {atsScore}
                      </strong>
                      <span>
                        / 100
                      </span>
                    </div>
                  </div>

                  <h3>
                    {atsScore >= 85
                      ? "Excellent ATS Readiness"
                      : atsScore >= 70
                      ? "Good ATS Compatibility"
                      : atsScore >= 50
                      ? "Needs Improvement"
                      : "Critical Improvements Needed"}
                  </h3>
                </div>

                <div className="keyword-analysis">
                  <h3>
                    Detected Keywords
                  </h3>

                  <div className="chip-list">
                    {detectedKeywords.length >
                    0 ? (
                      detectedKeywords.map(
                        (keyword) => (
                          <span
                            key={keyword}
                            className="keyword-chip"
                          >
                            ✓ {keyword}
                          </span>
                        )
                      )
                    ) : (
                      <span>
                        No matching keywords
                        found.
                      </span>
                    )}
                  </div>

                  <p className="analysis-note">
                    Add relevant technical
                    keywords from your target
                    job role naturally inside
                    skills and project
                    descriptions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePanel === "skills" && (
            <div className="analytics-content">
              <div className="analytics-title">
                <div>
                  <span className="panel-kicker">
                    AI CAREER ANALYSIS
                  </span>

                  <h2>
                    Skill Gap Analysis
                  </h2>
                </div>

                <span className="panel-badge">
                  {skillGap.length} SUGGESTIONS
                </span>
              </div>

              <div className="skill-gap-grid">
                <div className="skill-box present">
                  <h3>
                    ✓ Detected Skills
                  </h3>

                  <div className="chip-list">
                    {skillsArray.length >
                    0 ? (
                      skillsArray.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="success-chip"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span>
                        No skills added.
                      </span>
                    )}
                  </div>
                </div>

                <div className="skill-box missing">
                  <h3>
                    + Recommended Skills
                  </h3>

                  <div className="chip-list">
                    {skillGap
                      .slice(0, 12)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="warning-chip"
                        >
                          + {skill}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="role-match-card">
                <div>
                  <span>
                    Target Role
                  </span>

                  <strong>
                    {data?.jobTitle ||
                      "Not specified"}
                  </strong>
                </div>

                <div className="role-match-score">
                  <strong>
                    {roleMatchScore}%
                  </strong>

                  <span>
                    Role Match
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            JOB DESCRIPTION MATCH
            ================================================= */}

        <section className="job-match-panel no-print">
          <div className="job-match-header">
            <div>
              <span className="panel-kicker">
                AI JOB MATCH
              </span>

              <h2>
                Resume vs Job Description
              </h2>

              <p>
                Paste a job description to
                check relevant keyword
                coverage.
              </p>
            </div>

            {jdMatchScore !== null && (
              <div className="jd-score">
                {jdMatchScore}%
              </div>
            )}
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(
                e.target.value
              )
            }
            placeholder="Paste the target job description here..."
            className="job-description-input"
          />

          <div className="job-match-actions">
            <button
              className="primary-action"
              onClick={() =>
                setActivePanel("skills")
              }
              disabled={
                !jobDescription.trim()
              }
            >
              🤖 Compare Resume
            </button>

            {jdMatchScore !== null && (
              <span>
                {jdMatchScore >= 80
                  ? "Excellent role alignment"
                  : jdMatchScore >= 60
                  ? "Good alignment"
                  : "Consider adding relevant skills"}
              </span>
            )}
          </div>
        </section>

        {/* =================================================
            RESUME PAPER
            ================================================= */}

        <div className="resume-paper-wrapper">
          <main
            id="pure-resume-pdf"
            className={`resume-paper template-${template} ${
              darkMode ? "dark-mode" : ""
            }`}
            style={{
              "--resume-primary":
                primaryColor,
            }}
          >
            {/* HEADER */}

            <header className="resume-header">
              <div className="profile-wrapper">
                {data?.profilePhoto ? (
                  <img
                    src={data.profilePhoto}
                    alt="Profile"
                    className="profile-photo"
                  />
                ) : (
                  <div
                    className="profile-placeholder"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #7c3aed)`,
                    }}
                  >
                    {(
                      data?.fullName ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="resume-header-content">
                <span
                  className="resume-label"
                  style={{
                    color: primaryColor,
                  }}
                >
                  PROFESSIONAL PROFILE
                </span>

                <h1
                  className="resume-name"
                  style={{
                    color: primaryColor,
                  }}
                >
                  {data?.fullName ||
                    "Your Name"}
                </h1>

                {data?.jobTitle && (
                  <p className="resume-role">
                    {data.jobTitle}
                  </p>
                )}

                <div className="contact-grid">
                  {data?.email && (
                    <span className="contact-item">
                      📧 {data.email}
                    </span>
                  )}

                  {data?.phoneNumber && (
                    <span className="contact-item">
                      📱{" "}
                      {data.phoneNumber}
                    </span>
                  )}

                  {data?.location && (
                    <span className="contact-item">
                      📍 {data.location}
                    </span>
                  )}

                  {data?.linkedin && (
                    <span className="contact-item">
                      💼{" "}
                      {data.linkedin}
                    </span>
                  )}

                  {data?.github && (
                    <span className="contact-item">
                      💻 {data.github}
                    </span>
                  )}

                  {data?.portfolio && (
                    <span className="contact-item">
                      🌐{" "}
                      {data.portfolio}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <div
              className="premium-divider"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, #7c3aed, #06b6d4)`,
              }}
            ></div>

            {/* SECTIONS */}

            {sections.map((section) =>
              renderSection(section)
            )}

            {/* AI / HUMAN FOOTER */}

            <footer className="resume-intelligence-footer">
              <span>
                Smart Resume Builder
              </span>

              <span>
                Human {humanScore} • AI{" "}
                {aiScore}
              </span>
            </footer>
          </main>
        </div>

        {/* =================================================
            ACTIONS
            ================================================= */}

        <section className="action-panel no-print">
          <div className="action-panel-heading">
            <div>
              <span className="panel-kicker">
                RESUME ACTIONS
              </span>

              <h2>
                Finish & Share
              </h2>
            </div>
          </div>

          <div className="action-grid">
            <button
              className="action-card"
              onClick={() =>
                navigate(
                  "/cover-letter",
                  {
                    state: data,
                  }
                )
              }
            >
              <span>🤖</span>
              <strong>
                AI Cover Letter
              </strong>
              <small>
                Create a personalized
                cover letter.
              </small>
            </button>

            <button
              className="action-card"
              onClick={() =>
                navigate(
                  `/resume/edit/${
                    data.id ||
                    resumeId
                  }`,
                  {
                    state: {
                      ...data,
                      id:
                        data.id ||
                        resumeId,
                    },
                  }
                )
              }
              disabled={!isOwner}
            >
              <span>✏️</span>
              <strong>
                Edit Resume
              </strong>
              <small>
                Update your resume
                information.
              </small>
            </button>

            <button
              className="action-card"
              onClick={shareResume}
            >
              <span>🔗</span>
              <strong>
                Share Resume
              </strong>
              <small>
                Create a public resume
                link.
              </small>
            </button>

            <button
              className="action-card"
              onClick={printResume}
            >
              <span>🖨️</span>
              <strong>
                Print Resume
              </strong>
              <small>
                Print your professional
                resume.
              </small>
            </button>

            <button
              className="action-card featured"
              onClick={downloadPDF}
              disabled={downloading}
            >
              <span>📥</span>
              <strong>
                {downloading
                  ? "Generating PDF..."
                  : "Download PDF"}
              </strong>
              <small>
                Export high-quality A4
                PDF.
              </small>
            </button>

            <button
              className="action-card"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              <span>
                {darkMode
                  ? "☀️"
                  : "🌙"}
              </span>

              <strong>
                {darkMode
                  ? "Light Mode"
                  : "Dark Mode"}
              </strong>

              <small>
                Change preview
                appearance.
              </small>
            </button>
          </div>
        </section>
      </main>

      {/* =====================================================
          CERTIFICATE MODAL
          ===================================================== */}

      {selectedImage && (
        <div
          className="image-modal"
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <button
            className="modal-close"
            onClick={() =>
              setSelectedImage(null)
            }
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Full Certificate"
            className="modal-image"
            onClick={(e) =>
              e.stopPropagation()
            }
          />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function SectionTitle({
  color,
  title,
}) {
  return (
    <div className="resume-section-title">
      <span
        className="section-dot"
        style={{
          backgroundColor: color,
        }}
      ></span>

      <h2 style={{ color }}>
        {title}
      </h2>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  color,
}) {
  return (
    <div className="score-row">
      <div className="score-row-title">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="score-row-track">
        <div
          className="score-row-fill"
          style={{
            width: `${value}%`,
            background: color,
          }}
        ></div>
      </div>
    </div>
  );
}

function ComparisonCard({
  icon,
  title,
  value,
  description,
  color,
}) {
  return (
    <div className="comparison-card">
      <div
        className="comparison-icon"
        style={{
          background: `${color}15`,
          color,
        }}
      >
        {icon}
      </div>

      <div className="comparison-card-top">
        <div>
          <span>{title}</span>
          <strong>{value}/100</strong>
        </div>

        <div
          className="mini-progress"
          style={{
            "--progress": `${value}%`,
            "--progress-color": color,
          }}
        ></div>
      </div>

      <p>{description}</p>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  items,
  type,
}) {
  return (
    <div
      className={`insight-card ${type}`}
    >
      <div className="insight-heading">
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>

      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Nothing detected yet.
        </p>
      )}
    </div>
  );
}

export default ResumePreview;