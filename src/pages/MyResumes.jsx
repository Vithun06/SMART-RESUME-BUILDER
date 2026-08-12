import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

function MyResumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  /* =====================================================
     FETCH USER RESUMES
  ===================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setResumes([]);
          setLoading(false);
          navigate("/login");
          return;
        }

        await fetchResumes(user.uid);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  /* =====================================================
     GET RESUMES
  ===================================================== */

  const fetchResumes = async (userId) => {
    try {
      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "resumes")
      );

      const data = querySnapshot.docs
        .map((resumeDoc) => ({
          id: resumeDoc.id,
          ...resumeDoc.data(),
        }))
        .filter(
          (resume) => resume.userId === userId
        )
        .sort((a, b) => {
          const dateA =
            a.updatedAt?.toMillis?.() || 0;

          const dateB =
            b.updatedAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

      setResumes(data);
    } catch (error) {
      console.error(
        "Error fetching resumes:",
        error
      );

      alert(
        "Failed to load your resumes."
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

      setResumes((prev) =>
        prev.filter(
          (resume) => resume.id !== id
        )
      );

      alert(
        "Resume deleted successfully."
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
     SEARCH
  ===================================================== */

  const filteredResumes =
    resumes.filter((resume) =>
      resume.fullName
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="my-resume-loading">
        <div className="my-resume-loading-spinner"></div>

        <p>
          Loading your resumes...
        </p>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

 return (
  <div className="my-resumes-page">

    <div className="my-resumes-header">
      <div className="my-resumes-title-area">
        <h1>My Resumes</h1>
        <p>Manage, edit and view your saved resumes</p>
      </div>
    </div>

    <div className="resume-search-wrapper">
      <input
        className="resume-search-input"
        type="text"
        placeholder="Search Resume..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
      />
    </div>

    {resumes.length === 0 ? (
      <div className="my-resumes-empty">
        <div className="my-resumes-empty-icon">
          📄
        </div>

        <h2>No Resumes Found</h2>

        <p>
          You haven't created any resumes yet.
        </p>
      </div>
    ) : (
      <div className="resume-history-list">

        {resumes
          .filter((resume) =>
            resume.fullName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map((resume) => (

            <div
              key={resume.id}
              className="resume-history-card"
            >

              <h3>{resume.fullName}</h3>

              <p>{resume.email}</p>

              <button
                onClick={() =>
                  navigate(`/resume/${resume.id}`)
                }
              >
                📄 View Resume
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/resume/edit/${resume.id}`,
                    {
                      state: resume,
                    }
                  )
                }
              >
                ✏️ Edit Resume
              </button>

              <button
                onClick={() =>
                  deleteResume(resume.id)
                }
              >
                🗑 Delete Resume
              </button>

            </div>

          ))}

      </div>
    )}

  </div>
);
}

export default MyResumes;