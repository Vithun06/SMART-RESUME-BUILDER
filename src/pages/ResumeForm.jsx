import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "../components/ResumeForm.css";

import {
  db,
  auth,
  storage,
} from "../services/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_PROFILE_SIZE = 1 * 1024 * 1024;

const MAX_CERT_IMAGE_SIZE =
  2 * 1024 * 1024;

const MAX_CERT_PDF_SIZE =
  2 * 1024 * 1024;


/* =========================================================
   INITIAL STATE
========================================================= */

const INITIAL_STATE = {
  fullName: "",
  email: "",
  phoneNumber: "",
  summary: "",
  skills: "",
  education: "",
  cgpa: "",

  /* DEFAULT = MODERN */
  template: "modern",

  isPublic: true,

  profilePhoto: "",
  profilePhotoPath: "",

  internship: {
    companyName: "",
    jobRole: "",
    description: "",
  },

  projects: [
    {
      projectName: "",
      projectDescription: "",
    },
  ],

  certifications: [
    {
      title: "",
      issuer: "",
      certificateFile: "",
      certificateFilePath: "",
      certificateFileType: "",
    },
  ],
};


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

const compressImage = (
  file,
  maxSizeBytes = MAX_PROFILE_SIZE
) => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = (event) => {
        const img =
          new Image();

        img.onload = () => {
          const canvas =
            document.createElement(
              "canvas"
            );

          let width =
            img.width;

          let height =
            img.height;

          const MAX_DIMENSION =
            1600;

          if (
            width >
              MAX_DIMENSION ||
            height >
              MAX_DIMENSION
          ) {
            if (
              width >
              height
            ) {
              height =
                (height /
                  width) *
                MAX_DIMENSION;

              width =
                MAX_DIMENSION;
            } else {
              width =
                (width /
                  height) *
                MAX_DIMENSION;

              height =
                MAX_DIMENSION;
            }
          }

          canvas.width =
            width;

          canvas.height =
            height;

          const ctx =
            canvas.getContext(
              "2d"
            );

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          let quality = 0.85;

          const tryCompress =
            () => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(
                      new Error(
                        "Image compression failed."
                      )
                    );

                    return;
                  }

                  if (
                    blob.size <=
                      maxSizeBytes ||
                    quality <= 0.35
                  ) {
                    const compressedFile =
                      new File(
                        [blob],
                        file.name.replace(
                          /\.[^/.]+$/,
                          ".jpg"
                        ),
                        {
                          type:
                            "image/jpeg",
                        }
                      );

                    resolve(
                      compressedFile
                    );

                    return;
                  }

                  quality -= 0.1;

                  tryCompress();
                },
                "image/jpeg",
                quality
              );
            };

          tryCompress();
        };

        img.onerror =
          reject;

        img.src =
          event.target.result;
      };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );
    }
  );
};


/* =========================================================
   RESUME FORM
========================================================= */

const ResumeForm = () => {
  const {
    resumeId,
  } = useParams();

  const navigate =
    useNavigate();


  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    formData,
    setFormData,
  ] = useState(() => {
    try {
      const savedDraft =
        localStorage.getItem(
          "resume_draft"
        );

      if (!savedDraft) {
        return INITIAL_STATE;
      }

      const parsed =
        JSON.parse(
          savedDraft
        );

      return {
        ...INITIAL_STATE,
        ...parsed,

        /* Always fallback to modern */
        template:
          parsed.template ||
          "modern",

        internship: {
          ...INITIAL_STATE.internship,
          ...(parsed.internship ||
            {}),
        },

        projects:
          parsed.projects
            ?.length > 0
            ? parsed.projects
            : INITIAL_STATE.projects,

        certifications:
          parsed.certifications
            ?.length > 0
            ? parsed.certifications
            : INITIAL_STATE.certifications,
      };
    } catch {
      localStorage.removeItem(
        "resume_draft"
      );

      return INITIAL_STATE;
    }
  });


  /* =======================================================
     UI STATES
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    fetching,
    setFetching,
  ] = useState(true);

  const [
    photoUploading,
    setPhotoUploading,
  ] = useState(false);

  const [
    certificateUploading,
    setCertificateUploading,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState("personal");


  /* =======================================================
     AUTO SAVE
  ======================================================= */

  useEffect(() => {
    if (!resumeId) {
      try {
        localStorage.setItem(
          "resume_draft",
          JSON.stringify(
            formData
          )
        );
      } catch (error) {
        console.warn(
          "Draft save failed",
          error
        );
      }
    }
  }, [
    formData,
    resumeId,
  ]);


  /* =======================================================
     AUTH + FETCH
  ======================================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (
          currentUser
        ) => {
          if (!currentUser) {
            setFetching(
              false
            );

            navigate(
              "/login"
            );

            return;
          }

          if (resumeId) {
            try {
              const docRef =
                doc(
                  db,
                  "resumes",
                  resumeId
                );

              const snapshot =
                await getDoc(
                  docRef
                );

              if (
                !snapshot.exists()
              ) {
                alert(
                  "Resume not found."
                );

                navigate(
                  "/my-resumes"
                );

                return;
              }

              const data =
                snapshot.data();

              if (
                data.userId !==
                currentUser.uid
              ) {
                alert(
                  "You do not have permission to edit this resume."
                );

                navigate(
                  "/my-resumes"
                );

                return;
              }

              setFormData({
                ...INITIAL_STATE,
                ...data,

                template:
                  data.template ||
                  "modern",

                internship: {
                  ...INITIAL_STATE.internship,
                  ...(data.internship ||
                    {}),
                },

                projects:
                  data.projects
                    ?.length > 0
                    ? data.projects
                    : INITIAL_STATE.projects,

                certifications:
                  data.certifications
                    ?.length > 0
                    ? data.certifications
                    : INITIAL_STATE.certifications,
              });
            } catch (error) {
              console.error(
                error
              );

              alert(
                "Failed to load resume."
              );
            }
          }

          setFetching(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, [
    resumeId,
    navigate,
  ]);


  /* =======================================================
     COMPLETION
  ======================================================= */

  const completion =
    useMemo(() => {
      const checks = [
        formData.fullName?.trim(),
        formData.email?.trim(),
        formData.phoneNumber?.trim(),
        formData.summary?.trim(),
        formData.skills?.trim(),
        formData.education?.trim(),
        formData.cgpa?.trim(),
        formData.profilePhoto,

        formData.internship
          ?.companyName?.trim(),

        formData.internship
          ?.jobRole?.trim(),

        formData.internship
          ?.description?.trim(),

        formData.projects?.some(
          (project) =>
            project.projectName?.trim() ||
            project.projectDescription?.trim()
        ),

        formData.certifications?.some(
          (certificate) =>
            certificate.title?.trim() ||
            certificate.issuer?.trim()
        ),
      ];

      const completed =
        checks.filter(
          Boolean
        ).length;

      return Math.round(
        (completed /
          checks.length) *
          100
      );
    }, [formData]);


  /* =======================================================
     SECTION STATUS
  ======================================================= */

  const sectionStatus = {
    personal:
      !!formData.fullName &&
      !!formData.email,

    education:
      !!formData.education &&
      !!formData.cgpa,

    experience:
      !!formData.internship
        ?.companyName ||
      !!formData.internship
        ?.jobRole ||
      !!formData.internship
        ?.description,

    skills:
      !!formData.skills,

    projects:
      formData.projects?.some(
        (project) =>
          project.projectName ||
          project.projectDescription
      ),

    certificates:
      formData.certifications?.some(
        (certificate) =>
          certificate.title ||
          certificate.issuer
      ),
  };


  /* =======================================================
     BASIC CHANGE
  ======================================================= */

  const handleChange =
    (e) => {
      const {
        name,
        value,
        type,
        checked,
      } = e.target;

      setFormData(
        (prev) => ({
          ...prev,

          [name]:
            type ===
            "checkbox"
              ? checked
              : value,
        })
      );
    };


  /* =======================================================
     NESTED CHANGE
  ======================================================= */

  const handleNestedChange =
    (
      category,
      field,
      value
    ) => {
      setFormData(
        (prev) => ({
          ...prev,

          [category]: {
            ...prev[
              category
            ],

            [field]:
              value,
          },
        })
      );
    };


  /* =======================================================
     PHONE
  ======================================================= */

  const handlePhoneChange =
    (e) => {
      const value =
        e.target.value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            10
          );

      setFormData(
        (prev) => ({
          ...prev,
          phoneNumber:
            value,
        })
      );
    };


  /* =======================================================
     ARRAY CHANGE
  ======================================================= */

  const handleArrayChange =
    (
      arrayName,
      index,
      field,
      value
    ) => {
      setFormData(
        (prev) => ({
          ...prev,

          [arrayName]:
            prev[
              arrayName
            ].map(
              (
                item,
                i
              ) =>
                i === index
                  ? {
                      ...item,
                      [field]:
                        value,
                    }
                  : item
            ),
        })
      );
    };


  /* =======================================================
     ADD ITEM
  ======================================================= */

  const addArrayItem =
    (
      arrayName,
      newItem
    ) => {
      setFormData(
        (prev) => ({
          ...prev,

          [arrayName]: [
            ...prev[
              arrayName
            ],
            newItem,
          ],
        })
      );
    };


  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeArrayItem =
    (
      arrayName,
      index
    ) => {
      setFormData(
        (prev) => ({
          ...prev,

          [arrayName]:
            prev[
              arrayName
            ].filter(
              (_, i) =>
                i !== index
            ),
        })
      );
    };


  /* =======================================================
     PROFILE IMAGE
  ======================================================= */

  const handleImageUpload =
    async (e) => {
      const originalFile =
        e.target.files?.[0];

      if (!originalFile)
        return;

      if (
        !originalFile.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Please select an image."
        );

        return;
      }

      setPhotoUploading(
        true
      );

      try {
        const user =
          auth.currentUser;

        if (!user) {
          alert(
            "Please login first."
          );

          return;
        }

        const file =
          await compressImage(
            originalFile,
            MAX_PROFILE_SIZE
          );

        const filePath =
          `profile_photos/${user.uid}/` +
          `${Date.now()}_profile.jpg`;

        const storageRef =
          ref(
            storage,
            filePath
          );

        await uploadBytes(
          storageRef,
          file,
          {
            contentType:
              "image/jpeg",
          }
        );

        const url =
          await getDownloadURL(
            storageRef
          );

        if (
          formData.profilePhotoPath
        ) {
          deleteObject(
            ref(
              storage,
              formData.profilePhotoPath
            )
          ).catch(
            () => {}
          );
        }

        setFormData(
          (prev) => ({
            ...prev,

            profilePhoto:
              url,

            profilePhotoPath:
              filePath,
          })
        );
      } catch (error) {
        console.error(
          error
        );

        alert(
          "Profile photo upload failed."
        );
      } finally {
        setPhotoUploading(
          false
        );
      }
    };


  /* =======================================================
     CERTIFICATE UPLOAD
  ======================================================= */

  const handleCertificateFileUpload =
    async (
      e,
      index
    ) => {
      const originalFile =
        e.target.files?.[0];

      if (!originalFile)
        return;

      const allowedTypes =
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/pdf",
        ];

      if (
        !allowedTypes.includes(
          originalFile.type
        )
      ) {
        alert(
          "Only JPG, PNG and PDF files are allowed."
        );

        return;
      }

      const isPdf =
        originalFile.type ===
        "application/pdf";

      const limit =
        isPdf
          ? MAX_CERT_PDF_SIZE
          : MAX_CERT_IMAGE_SIZE;

      if (
        originalFile.size >
        limit
      ) {
        alert(
          isPdf
            ? "PDF must be less than 2MB."
            : "Certificate image must be less than 2MB."
        );

        return;
      }

      setCertificateUploading(
        true
      );

      try {
        const user =
          auth.currentUser;

        if (!user) {
          alert(
            "Please login first."
          );

          return;
        }

        let file =
          originalFile;

        if (!isPdf) {
          file =
            await compressImage(
              originalFile,
              MAX_CERT_IMAGE_SIZE
            );
        }

        const extension =
          isPdf
            ? "pdf"
            : "jpg";

        const filePath =
          `certificate_files/${user.uid}/` +
          `${Date.now()}_certificate.${extension}`;

        const storageRef =
          ref(
            storage,
            filePath
          );

        await uploadBytes(
          storageRef,
          file,
          {
            contentType:
              isPdf
                ? "application/pdf"
                : "image/jpeg",
          }
        );

        const url =
          await getDownloadURL(
            storageRef
          );

        const oldPath =
          formData.certifications[
            index
          ]
            ?.certificateFilePath;

        if (oldPath) {
          await deleteObject(
            ref(
              storage,
              oldPath
            )
          ).catch(
            () => {}
          );
        }

        setFormData(
          (prev) => {
            const updated =
              [
                ...prev.certifications,
              ];

            updated[index] =
              {
                ...updated[
                  index
                ],

                certificateFile:
                  url,

                certificateFilePath:
                  filePath,

                certificateFileType:
                  isPdf
                    ? "application/pdf"
                    : "image/jpeg",
              };

            return {
              ...prev,

              certifications:
                updated,
            };
          }
        );
      } catch (error) {
        console.error(
          error
        );

        alert(
          "Certificate upload failed."
        );
      } finally {
        setCertificateUploading(
          false
        );
      }
    };


  /* =======================================================
     REMOVE CERTIFICATE
  ======================================================= */

  const handleRemoveCertificateFile =
    async (index) => {
      const certificate =
        formData.certifications[
          index
        ];

      if (!certificate)
        return;

      if (
        !window.confirm(
          "Remove this certificate?"
        )
      ) {
        return;
      }

      try {
        if (
          certificate.certificateFilePath
        ) {
          await deleteObject(
            ref(
              storage,
              certificate.certificateFilePath
            )
          ).catch(
            () => {}
          );
        }

        setFormData(
          (prev) => {
            const updated =
              [
                ...prev.certifications,
              ];

            updated[index] =
              {
                ...updated[
                  index
                ],

                certificateFile:
                  "",

                certificateFilePath:
                  "",

                certificateFileType:
                  "",
              };

            return {
              ...prev,

              certifications:
                updated,
            };
          }
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };


  /* =======================================================
     SECTION NAVIGATION
  ======================================================= */

  const goToSection =
    (section) => {
      setActiveSection(
        section
      );

      const element =
        document.getElementById(
          `section-${section}`
        );

      if (element) {
        element.scrollIntoView(
          {
            behavior:
              "smooth",

            block: "start",
          }
        );
      }
    };


  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Please login first."
        );

        return;
      }

      if (
        !formData.fullName.trim()
      ) {
        alert(
          "Full Name is required."
        );

        return;
      }

      if (
        !formData.email.trim()
      ) {
        alert(
          "Email is required."
        );

        return;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email.trim()
        )
      ) {
        alert(
          "Please enter a valid email."
        );

        return;
      }

      if (
        formData.phoneNumber &&
        formData.phoneNumber.length !==
          10
      ) {
        alert(
          "Phone number must contain 10 digits."
        );

        return;
      }

      if (
        formData.cgpa
      ) {
        const cgpa =
          Number(
            formData.cgpa
          );

        if (
          cgpa < 0 ||
          cgpa > 10
        ) {
          alert(
            "CGPA must be between 0 and 10."
          );

          return;
        }
      }

      setLoading(true);

      try {
        const payload = {
          ...formData,

          template:
            formData.template ||
            "modern",

          projects:
            formData.projects.filter(
              (project) =>
                project.projectName?.trim() ||
                project.projectDescription?.trim()
            ),

          certifications:
            formData.certifications.filter(
              (certificate) =>
                certificate.title?.trim() ||
                certificate.issuer?.trim()
            ),

          userId:
            user.uid,

          updatedAt:
            serverTimestamp(),
        };

        let targetId =
          resumeId;

        if (resumeId) {
          const docRef =
            doc(
              db,
              "resumes",
              resumeId
            );

          const snapshot =
            await getDoc(
              docRef
            );

          if (
            !snapshot.exists()
          ) {
            alert(
              "Resume does not exist."
            );

            navigate(
              "/my-resumes"
            );

            return;
          }

          if (
            snapshot.data()
              .userId !==
            user.uid
          ) {
            alert(
              "You do not have permission."
            );

            navigate(
              "/my-resumes"
            );

            return;
          }

          await updateDoc(
            docRef,
            payload
          );
        } else {
          payload.createdAt =
            serverTimestamp();

          const docRef =
            await addDoc(
              collection(
                db,
                "resumes"
              ),
              payload
            );

          targetId =
            docRef.id;
        }

        localStorage.removeItem(
          "resume_draft"
        );

        navigate(
          `/resume-preview/${targetId}`
        );
      } catch (error) {
        console.error(
          error
        );

        alert(
          "Failed to save resume."
        );
      } finally {
        setLoading(
          false
        );
      }
    };


  /* =======================================================
     CLEAR DRAFT
  ======================================================= */

  const handleClearDraft =
    () => {
      if (
        !window.confirm(
          "Clear your current draft?"
        )
      ) {
        return;
      }

      localStorage.removeItem(
        "resume_draft"
      );

      setFormData({
        ...INITIAL_STATE,
      });
    };


  /* =======================================================
     LOADING
  ======================================================= */

  if (fetching) {
    return (
      <div className="resume-loading">
        <div className="resume-loading-spinner" />

        <p>
          Loading your resume...
        </p>
      </div>
    );
  }


  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="resume-page">

      <div className="resume-bg-shape resume-bg-shape-one" />
      <div className="resume-bg-shape resume-bg-shape-two" />
      <div className="resume-bg-shape resume-bg-shape-three" />


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="resume-header">

        <div className="resume-header-left">

          <div className="resume-brand-icon">
            ✦
          </div>

          <div>
            <h1>
              {resumeId
                ? "Edit Resume"
                : "Create Resume"}
            </h1>

            <p>
              Build a modern,
              ATS-friendly resume
            </p>
          </div>

        </div>

        <div className="resume-header-actions">

          {!resumeId && (
            <button
              type="button"
              className="resume-clear-btn"
              onClick={
                handleClearDraft
              }
            >
              Clear Draft
            </button>
          )}

        </div>

      </header>


      {/* =================================================
          COMPLETION
      ================================================= */}

      <section className="resume-completion-card">

        <div className="completion-info">

          <div>
            <span>
              Resume Completion
            </span>

            <h2>
              {completion}%
            </h2>
          </div>

          <div className="completion-message">

            {completion < 40 &&
              "Let's build your resume 🚀"}

            {completion >= 40 &&
              completion < 70 &&
              "Good progress! Keep going 💪"}

            {completion >= 70 &&
              completion < 100 &&
              "Almost ready ✨"}

            {completion === 100 &&
              "Your resume is ready 🎉"}

          </div>

        </div>

        <div className="completion-progress">
          <div
            className="completion-progress-fill"
            style={{
              width:
                `${completion}%`,
            }}
          />
        </div>

      </section>


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="resume-layout">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="resume-sidebar">

          <div className="sidebar-card">

            <div className="sidebar-title">
              Resume Sections
            </div>


            {[
              [
                "personal",
                "Personal",
                "👤",
                sectionStatus.personal,
              ],

              [
                "education",
                "Education",
                "🎓",
                sectionStatus.education,
              ],

              [
                "experience",
                "Experience",
                "💼",
                sectionStatus.experience,
              ],

              [
                "skills",
                "Skills",
                "🧠",
                sectionStatus.skills,
              ],

              [
                "projects",
                "Projects",
                "📂",
                sectionStatus.projects,
              ],

              [
                "certificates",
                "Certificates",
                "🏆",
                sectionStatus.certificates,
              ],

              [
                "preview",
                "Preview",
                "👁",
                true,
              ],
            ].map(
              ([
                id,
                label,
                icon,
                completed,
              ], index) => (
                <button
                  key={id}
                  type="button"
                  className={`stepper-item ${
                    activeSection ===
                    id
                      ? "active"
                      : ""
                  } ${
                    completed
                      ? "completed"
                      : ""
                  }`}
                  onClick={() =>
                    goToSection(
                      id
                    )
                  }
                >
                  <span className="stepper-number">
                    {index + 1}
                  </span>

                  <span>
                    {icon}{" "}
                    {label}
                  </span>

                  {completed && (
                    <span className="stepper-check">
                      ✓
                    </span>
                  )}
                </button>
              )
            )}

          </div>


          <div className="sidebar-tip">

            <div className="tip-icon">
              ✨
            </div>

            <div>
              <strong>
                Pro Tip
              </strong>

              <p>
                Use measurable
                achievements and
                relevant skills.
              </p>
            </div>

          </div>

        </aside>


        {/* =================================================
            FORM
        ================================================= */}

        <main className="resume-form-container">

          <form
            onSubmit={
              handleSubmit
            }
          >


            {/* =================================================
                SETTINGS
            ================================================= */}

            <section className="resume-section-card">

              <div className="section-heading">

                <div className="section-icon">
                  ⚙
                </div>

                <div>
                  <h2>
                    Resume Settings
                  </h2>

                  <p>
                    Configure your
                    resume appearance
                    and visibility.
                  </p>
                </div>

              </div>


              <div className="settings-grid">

                <div className="setting-item">

                  <div>
                    <label>
                      Public Visibility
                    </label>

                    <p>
                      Allow others to
                      view your resume
                      link.
                    </p>
                  </div>

                  <label className="premium-switch">

                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={
                        formData.isPublic
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span />
                  </label>

                </div>


                <div className="form-group">

                  <label>
                    Resume Template
                  </label>

                  <select
                    name="template"
                    value={
                      formData.template
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="modern">
                      Modern — Recommended
                    </option>

                    <option value="classic">
                      Classic Professional
                    </option>

                    <option value="minimal">
                      Minimalist
                    </option>
                  </select>

                </div>

              </div>

            </section>


            {/* =================================================
                PROFILE PHOTO
            ================================================= */}

            <section className="resume-section-card">

              <div className="section-heading">

                <div className="section-icon">
                  📸
                </div>

                <div>
                  <h2>
                    Profile Photo
                  </h2>

                  <p>
                    Add a clean
                    professional photo.
                  </p>
                </div>

              </div>


              <div className="profile-upload-area">

                <div className="profile-preview">

                  {formData.profilePhoto ? (
                    <img
                      src={
                        formData.profilePhoto
                      }
                      alt="Profile"
                    />
                  ) : (
                    <span>
                      👤
                    </span>
                  )}

                </div>


                <div className="profile-upload-info">

                  <label className="upload-button">

                    {photoUploading
                      ? "Compressing..."
                      : "Upload Photo"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                      disabled={
                        photoUploading
                      }
                    />

                  </label>

                  <p>
                    JPG / PNG ·
                    Automatically
                    optimized · Max
                    1MB
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                PERSONAL
            ================================================= */}

            <section
              id="section-personal"
              className="resume-section-card"
            >

              <div className="section-heading">

                <div className="section-icon">
                  👤
                </div>

                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Tell employers
                    who you are.
                  </p>
                </div>

              </div>


              <div className="form-grid-3">

                <div className="form-group">
                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>


                <div className="form-group">
                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={
                      formData.phoneNumber
                    }
                    onChange={
                      handlePhoneChange
                    }
                    placeholder="10 digit number"
                    maxLength={10}
                  />
                </div>

              </div>

            </section>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="resume-section-card">

              <div className="section-heading">

                <div className="section-icon">
                  ✍
                </div>

                <div>
                  <h2>
                    Professional Summary
                  </h2>

                  <p>
                    Create a strong
                    professional
                    introduction.
                  </p>
                </div>

              </div>


              <div className="form-group">

                <label>
                  About You
                </label>

                <textarea
                  name="summary"
                  value={
                    formData.summary
                  }
                  onChange={
                    handleChange
                  }
                  rows={5}
                  placeholder="Example: BCA student passionate about Java, React and software development..."
                />

              </div>

            </section>


            {/* =================================================
                EDUCATION
            ================================================= */}

            <section
              id="section-education"
              className="resume-section-card"
            >

              <div className="section-heading">

                <div className="section-icon">
                  🎓
                </div>

                <div>
                  <h2>
                    Education
                  </h2>

                  <p>
                    Add your academic
                    background.
                  </p>
                </div>

              </div>


              <div className="form-grid-2">

                <div className="form-group">

                  <label>
                    Education
                  </label>

                  <input
                    type="text"
                    name="education"
                    value={
                      formData.education
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="BCA — Computer Applications"
                  />

                </div>


                <div className="form-group">

                  <label>
                    CGPA
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cgpa"
                    value={
                      formData.cgpa
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0.00 — 10.00"
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                SKILLS
            ================================================= */}

            <section
              id="section-skills"
              className="resume-section-card"
            >

              <div className="section-heading">

                <div className="section-icon">
                  🧠
                </div>

                <div>
                  <h2>
                    Skills & Expertise
                  </h2>

                  <p>
                    Add technologies
                    and professional
                    skills.
                  </p>
                </div>

              </div>


              <div className="form-group">

                <label>
                  Skills
                </label>

                <input
                  type="text"
                  name="skills"
                  value={
                    formData.skills
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Java, React, SQL, HTML, CSS"
                />

                <small>
                  Separate skills
                  with commas.
                </small>

              </div>

            </section>


            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <section
              id="section-experience"
              className="resume-section-card"
            >

              <div className="section-heading">

                <div className="section-icon">
                  💼
                </div>

                <div>
                  <h2>
                    Internship & Experience
                  </h2>

                  <p>
                    Showcase your
                    practical
                    experience.
                  </p>
                </div>

              </div>


              <div className="form-grid-2">

                <div className="form-group">

                  <label>
                    Company
                  </label>

                  <input
                    value={
                      formData.internship
                        .companyName
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "internship",
                        "companyName",
                        e.target.value
                      )
                    }
                    placeholder="Company / Organization"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Job Role
                  </label>

                  <input
                    value={
                      formData.internship
                        .jobRole
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "internship",
                        "jobRole",
                        e.target.value
                      )
                    }
                    placeholder="Software Developer Intern"
                  />

                </div>

              </div>


              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  rows={5}
                  value={
                    formData.internship
                      .description
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      "internship",
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe responsibilities, achievements and technologies..."
                />

              </div>

            </section>


            {/* =================================================
                PROJECTS
            ================================================= */}

            <section
              id="section-projects"
              className="resume-section-card"
            >

              <div className="section-heading section-heading-between">

                <div className="section-heading">

                  <div className="section-icon">
                    📂
                  </div>

                  <div>
                    <h2>
                      Projects
                    </h2>

                    <p>
                      Showcase your
                      strongest work.
                    </p>
                  </div>

                </div>


                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() =>
                    addArrayItem(
                      "projects",
                      {
                        projectName:
                          "",
                        projectDescription:
                          "",
                      }
                    )
                  }
                >
                  + Add Project
                </button>

              </div>


              <div className="dynamic-list">

                {formData.projects.map(
                  (
                    project,
                    index
                  ) => (
                    <div
                      key={index}
                      className="dynamic-item"
                    >

                      <div className="dynamic-item-header">

                        <strong>
                          Project{" "}
                          {index + 1}
                        </strong>

                        {formData.projects
                          .length >
                          1 && (
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() =>
                              removeArrayItem(
                                "projects",
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        )}

                      </div>


                      <div className="form-group">

                        <label>
                          Project Name
                        </label>

                        <input
                          value={
                            project.projectName
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "projects",
                              index,
                              "projectName",
                              e.target.value
                            )
                          }
                          placeholder="Smart Resume Builder"
                        />

                      </div>


                      <div className="form-group">

                        <label>
                          Project Description
                        </label>

                        <textarea
                          rows={5}
                          value={
                            project.projectDescription
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "projects",
                              index,
                              "projectDescription",
                              e.target.value
                            )
                          }
                          placeholder="Describe features, technologies and your contribution..."
                        />

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>


            {/* =================================================
                CERTIFICATES
            ================================================= */}

            <section
              id="section-certificates"
              className="resume-section-card"
            >

              <div className="section-heading section-heading-between">

                <div className="section-heading">

                  <div className="section-icon">
                    🏆
                  </div>

                  <div>
                    <h2>
                      Certifications
                    </h2>

                    <p>
                      Add your professional
                      certificates.
                    </p>
                  </div>

                </div>


                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() =>
                    addArrayItem(
                      "certifications",
                      {
                        title:
                          "",
                        issuer:
                          "",
                        certificateFile:
                          "",
                        certificateFilePath:
                          "",
                        certificateFileType:
                          "",
                      }
                    )
                  }
                >
                  + Add Certification
                </button>

              </div>


              <div className="dynamic-list">

                {formData.certifications.map(
                  (
                    certificate,
                    index
                  ) => (
                    <div
                      key={index}
                      className="dynamic-item"
                    >

                      <div className="dynamic-item-header">

                        <strong>
                          Certification{" "}
                          {index + 1}
                        </strong>

                        {formData
                          .certifications
                          .length >
                          1 && (
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() =>
                              removeArrayItem(
                                "certifications",
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        )}

                      </div>


                      <div className="form-grid-2">

                        <div className="form-group">

                          <label>
                            Certificate Title
                          </label>

                          <input
                            value={
                              certificate.title
                            }
                            onChange={(e) =>
                              handleArrayChange(
                                "certifications",
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Java Programming"
                          />

                        </div>


                        <div className="form-group">

                          <label>
                            Issuer
                          </label>

                          <input
                            value={
                              certificate.issuer
                            }
                            onChange={(e) =>
                              handleArrayChange(
                                "certifications",
                                index,
                                "issuer",
                                e.target.value
                              )
                            }
                            placeholder="NPTEL / Infosys / Coursera"
                          />

                        </div>

                      </div>


                      <div className="certificate-upload-box">

                        <label>
                          📎 Certificate File
                        </label>

                        <p>
                          JPG / PNG /
                          PDF · Max
                          2MB
                        </p>


                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) =>
                            handleCertificateFileUpload(
                              e,
                              index
                            )
                          }
                          disabled={
                            certificateUploading
                          }
                        />


                        {certificate.certificateFile && (
                          <div className="certificate-preview">

                            {certificate
                              .certificateFileType ===
                            "application/pdf" ? (
                              <div className="certificate-pdf-preview">

                                <span>
                                  📄
                                </span>

                                <a
                                  href={
                                    certificate.certificateFile
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View PDF
                                </a>

                                <a
                                  href={
                                    certificate.certificateFile
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                >
                                  Download
                                </a>

                              </div>
                            ) : (
                              <img
                                src={
                                  certificate.certificateFile
                                }
                                alt="Certificate"
                              />
                            )}

                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() =>
                                handleRemoveCertificateFile(
                                  index
                                )
                              }
                            >
                              Remove File
                            </button>

                          </div>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>


            {/* =================================================
                LIVE PREVIEW
            ================================================= */}

            <section
              id="section-preview"
              className="resume-section-card"
            >

              <div className="section-heading">

                <div className="section-icon">
                  👁
                </div>

                <div>
                  <h2>
                    Live Resume Preview
                  </h2>

                  <p>
                    Your resume updates
                    instantly while you
                    type.
                  </p>
                </div>

              </div>


              <div className="live-preview-wrapper">

                <div className="resume-preview-paper">

                  <div className="preview-top">

                    <div>

                      <h1>
                        {formData.fullName ||
                          "Your Name"}
                      </h1>

                      <p className="preview-role">
                        {formData.internship
                          ?.jobRole ||
                          "Software Developer"}
                      </p>

                      <div className="preview-contact">

                        {formData.email && (
                          <span>
                            ✉{" "}
                            {
                              formData.email
                            }
                          </span>
                        )}

                        {formData.phoneNumber && (
                          <span>
                            ☎{" "}
                            {
                              formData.phoneNumber
                            }
                          </span>
                        )}

                      </div>

                    </div>


                    {formData.profilePhoto && (
                      <img
                        className="preview-profile-photo"
                        src={
                          formData.profilePhoto
                        }
                        alt="Profile"
                      />
                    )}

                  </div>


                  {formData.summary && (
                    <div className="preview-section">

                      <h3>
                        PROFILE
                      </h3>

                      <p>
                        {
                          formData.summary
                        }
                      </p>

                    </div>
                  )}


                  {formData.skills && (
                    <div className="preview-section">

                      <h3>
                        SKILLS
                      </h3>

                      <div className="preview-skills">

                        {formData.skills
                          .split(",")
                          .map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={
                                  index
                                }
                              >
                                {skill.trim()}
                              </span>
                            )
                          )}

                      </div>

                    </div>
                  )}


                  {formData.education && (
                    <div className="preview-section">

                      <h3>
                        EDUCATION
                      </h3>

                      <div className="preview-entry">

                        <strong>
                          {
                            formData.education
                          }
                        </strong>

                        {formData.cgpa && (
                          <span>
                            CGPA:{" "}
                            {
                              formData.cgpa
                            }
                          </span>
                        )}

                      </div>

                    </div>
                  )}


                  {formData.internship
                    ?.companyName && (
                    <div className="preview-section">

                      <h3>
                        EXPERIENCE
                      </h3>

                      <div className="preview-entry">

                        <strong>
                          {
                            formData
                              .internship
                              .jobRole
                          }
                        </strong>

                        <span>
                          {
                            formData
                              .internship
                              .companyName
                          }
                        </span>

                        <p>
                          {
                            formData
                              .internship
                              .description
                          }
                        </p>

                      </div>

                    </div>
                  )}


                  {formData.projects.some(
                    (p) =>
                      p.projectName
                  ) && (
                    <div className="preview-section">

                      <h3>
                        PROJECTS
                      </h3>

                      {formData.projects
                        .filter(
                          (p) =>
                            p.projectName
                        )
                        .map(
                          (
                            project,
                            index
                          ) => (
                            <div
                              className="preview-entry"
                              key={
                                index
                              }
                            >
                              <strong>
                                {
                                  project.projectName
                                }
                              </strong>

                              <p>
                                {
                                  project.projectDescription
                                }
                              </p>
                            </div>
                          )
                        )}

                    </div>
                  )}


                  {formData.certifications.some(
                    (c) =>
                      c.title
                  ) && (
                    <div className="preview-section">

                      <h3>
                        CERTIFICATIONS
                      </h3>

                      {formData.certifications
                        .filter(
                          (c) =>
                            c.title
                        )
                        .map(
                          (
                            certificate,
                            index
                          ) => (
                            <div
                              className="preview-entry"
                              key={
                                index
                              }
                            >

                              <strong>
                                {
                                  certificate.title
                                }
                              </strong>

                              <span>
                                {
                                  certificate.issuer
                                }
                              </span>

                            </div>
                          )
                        )}

                    </div>
                  )}

                </div>

              </div>

            </section>


            
               {/*   ACTIONS   */} 

               <div

className="resume-form-actions">

<button

type="button"

className="cancel-btn"

onClick={() =>

navigate(

"/my-resumes"

)

}

>

Cancel

</button>
<button

type="submit"

className="save-resume-btn"

disabled={

loading ||

photoUploading ||

certificateUploading

}

>

{loading? (

<>

<span

className="button-spinner" />

Saving...

</>

):(

<>

✨{" "}

{resumeId

? "Update & Preview"

: "Save & Preview"}

</>

)}

</button>

</div>

</form>

</main>

</div>

</div>
  );
};

export default ResumeForm;      