import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../services/firebase";

import "../components/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [downloadCount, setDownloadCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* =====================================================
     AUTH + DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setResumes([]);
        setDownloadCount(0);
        setFeedbackCount(0);
        setLoading(false);

        navigate("/login");
        return;
      }

      await fetchDashboardData(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);

      /* -----------------------------
         RESUMES
      ----------------------------- */

      const resumeQuery = query(
        collection(db, "resumes"),
        where("userId", "==", userId)
      );

      const resumeSnapshot = await getDocs(resumeQuery);

      const resumeList = resumeSnapshot.docs.map((resumeDoc) => ({
        id: resumeDoc.id,
        ...resumeDoc.data(),
      }));

      setResumes(resumeList);

      /* -----------------------------
         DOWNLOADS
      ----------------------------- */

      const downloadQuery = query(
        collection(db, "downloads"),
        where("userId", "==", userId)
      );

      const downloadSnapshot = await getDocs(downloadQuery);

      setDownloadCount(downloadSnapshot.size);

      /* -----------------------------
         FEEDBACKS
      ----------------------------- */

      const feedbackQuery = query(
        collection(db, "feedbacks"),
        where("userId", "==", userId)
      );

      const feedbackSnapshot = await getDocs(feedbackQuery);

      setFeedbackCount(feedbackSnapshot.size);

    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DELETE RESUME
  ===================================================== */

  const deleteResume = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "resumes", id)
      );

      setResumes((previousResumes) =>
        previousResumes.filter(
          (resume) => resume.id !== id
        )
      );

    } catch (error) {
      console.error(
        "Error deleting resume:",
        error
      );

      alert(
        "Failed to delete resume."
      );
    }
  };

  /* =====================================================
     COPY SHARE LINK
  ===================================================== */

  const copyPublicLink = async (resumeId) => {
    try {
      const shareUrl =
        `${window.location.origin}/resume-preview/${resumeId}`;

      await navigator.clipboard.writeText(
        shareUrl
      );

      alert(
        "Resume link copied successfully!\n\n" +
        shareUrl
      );

    } catch (error) {
      console.error(
        "Error copying link:",
        error
      );

      alert(
        "Unable to copy the link."
      );
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredResumes = resumes.filter((resume) => {
    const searchValue =
      search.toLowerCase().trim();

    return (
      resume.fullName
        ?.toLowerCase()
        .includes(searchValue) ||

      resume.degree
        ?.toLowerCase()
        .includes(searchValue) ||

      resume.email
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>

        <h3>Loading Dashboard...</h3>

        <p>
          Please wait while we load your data.
        </p>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="dashboard-container">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div className="dashboard-title">

          <span className="dashboard-eyebrow">
            SMART RESUME BUILDER
          </span>

          <h1>
            Welcome to your Dashboard
          </h1>

          <p>
            Manage your resumes, downloads
            and career documents in one place.
          </p>

        </div>

        <button
          className="create-btn"
          onClick={() =>
            navigate("/resume")
          }
        >
          <span>＋</span>
          Create New Resume
        </button>

      </div>


      {/* ================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card stat-purple">

          <div className="stat-icon">
            📄
          </div>

          <div className="stat-content">

            <span>
              Total Resumes
            </span>

            <strong>
              {resumes.length}
            </strong>

            <small>
              Saved in your account
            </small>

          </div>

        </div>


        <div className="stat-card stat-blue">

          <div className="stat-icon">
            📥
          </div>

          <div className="stat-content">

            <span>
              Total Downloads
            </span>

            <strong>
              {downloadCount}
            </strong>

            <small>
              Resume downloads
            </small>

          </div>

        </div>


        <div className="stat-card stat-green">

          <div className="stat-icon">
            💬
          </div>

          <div className="stat-content">

            <span>
              Feedbacks
            </span>

            <strong>
              {feedbackCount}
            </strong>

            <small>
              Feedbacks shared
            </small>

          </div>

        </div>

      </div>


      {/* ================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="dashboard-quick-actions">

        <button
          onClick={() =>
            navigate("/my-resumes")
          }
        >
          <span>📚</span>

          <div>
            <strong>
              My Resumes
            </strong>

            <small>
              View all saved resumes
            </small>
          </div>

          <b>→</b>
        </button>


        <button
          onClick={() =>
            navigate("/cover-letter")
          }
        >
          <span>✉️</span>

          <div>
            <strong>
              AI Cover Letter
            </strong>

            <small>
              Create a professional cover letter
            </small>
          </div>

          <b>→</b>
        </button>


        <button
          onClick={() =>
            navigate("/download-history")
          }
        >
          <span>📥</span>

          <div>
            <strong>
              Download History
            </strong>

            <small>
              View your previous downloads
            </small>
          </div>

          <b>→</b>
        </button>

      </div>


      {/* ================================================
          RESUME SECTION HEADER
      ================================================= */}

      <div className="resumes-section-header">

        <div>

          <span className="section-label">
            YOUR DOCUMENTS
          </span>

          <h2>
            My Resumes
            <span>
              {filteredResumes.length}
            </span>
          </h2>

        </div>


        <div className="search-wrapper">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search resumes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="search-box"
          />

          {search && (
            <button
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

      </div>


      {/* ================================================
          RESUMES
      ================================================= */}

      {filteredResumes.length > 0 ? (

        <div className="resume-grid">

          {filteredResumes.map((resume) => (

            <div
              className="resume-card"
              key={resume.id}
            >

              {/* Card Top */}

              <div className="resume-card-top">

                <div className="resume-document-icon">
                  📄
                </div>

                <span
                  className={`template-badge ${
                    resume.template || "classic"
                  }`}
                >
                  {resume.template || "classic"}
                </span>

              </div>


              {/* Resume Information */}

              <div className="resume-card-info">

                <h3>
                  {resume.fullName ||
                    "Untitled Resume"}
                </h3>

                <p>
                  🎓{" "}
                  {resume.degree ||
                    "Degree not specified"}
                </p>

                <p>
                  ✉️{" "}
                  {resume.email ||
                    "Email not specified"}
                </p>

              </div>


              {/* Actions */}

              <div className="card-buttons">

                <button
                  className="btn-view"
                  onClick={() =>
                    navigate(
                      `/resume-preview/${resume.id}`
                    )
                  }
                >
                  👁️
                  <span>View</span>
                </button>


                <button
                  className="btn-edit"
                  onClick={() =>
                    navigate(
                      `/resume/edit/${resume.id}`,
                      {
                        state: resume,
                      }
                    )
                  }
                >
                  ✏️
                  <span>Edit</span>
                </button>


                <button
                  className="btn-share"
                  onClick={() =>
                    copyPublicLink(
                      resume.id
                    )
                  }
                >
                  🔗
                  <span>Share</span>
                </button>


                <button
                  className="btn-delete"
                  onClick={() =>
                    deleteResume(
                      resume.id
                    )
                  }
                  title="Delete Resume"
                >
                  🗑️
                </button>

              </div>


              {/* Cover Letter */}

              <button
                className="btn-cover-letter"
                onClick={() =>
                  navigate(
                    "/cover-letter",
                    {
                      state: resume,
                    }
                  )
                }
              >
                ✨ Create AI Cover Letter
              </button>

            </div>

          ))}

        </div>

      ) : (

        <div className="empty-state">

          <div className="empty-icon">
            📄
          </div>

          <h3>
            {search
              ? "No matching resumes"
              : "No resumes yet"}
          </h3>

          <p>
            {search
              ? "Try searching with a different name or degree."
              : "Create your first professional resume to get started."}
          </p>

          {!search && (
            <button
              onClick={() =>
                navigate("/resume")
              }
            >
              ＋ Create Your First Resume
            </button>
          )}

        </div>

      )}

    </div>
  );
}

export default Dashboard;