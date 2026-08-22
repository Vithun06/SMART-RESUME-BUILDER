// src/services/appConfig.js

/* =========================================================
   SMART RESUME BUILDER
   APPLICATION CONFIGURATION
   ---------------------------------------------------------
   Purpose:
   - Central application settings
   - Appwrite configuration reference
   - AI configuration reference
   - Application limits
   - Feature flags
   - Environment configuration
   ========================================================= */

/* =========================================================
   ENVIRONMENT
   ========================================================= */

const ENVIRONMENT =
  import.meta.env.MODE || "development";

export const IS_DEVELOPMENT =
  ENVIRONMENT === "development";

export const IS_PRODUCTION =
  ENVIRONMENT === "production";

/* =========================================================
   APPLICATION INFORMATION
   ========================================================= */

export const APP_CONFIG = Object.freeze({
  name: "Smart Resume Builder",

  version: "2.0.0",

  environment: ENVIRONMENT,

  description:
    "AI-powered ATS-friendly resume builder for students and job seekers.",

  defaultLanguage: "en",

  supportedLanguages: [
    "en",
    "ta",
  ],
});

/* =========================================================
   APPLICATION ROUTES
   ========================================================= */

export const APP_ROUTES = Object.freeze({
  login: "/login",
  signup: "/signup",
  home: "/",
  resume: "/resume",
  resumes: "/resumes",
  settings: "/settings",
  about: "/about",
  feedback: "/feedback",
});

/* =========================================================
   STORAGE CONFIGURATION
   ---------------------------------------------------------
   Browser storage only.
   Actual file storage is handled by Appwrite Storage.
   ========================================================= */

export const STORAGE_CONFIG = Object.freeze({
  currentResumeKey:
    "smart_resume_current_resume",

  resumeDraftKey:
    "smart_resume_draft",

  themeKey:
    "smart_resume_theme",

  settingsKey:
    "smart_resume_settings",

  preferencesKey:
    "smart_resume_preferences",

  userKey:
    "smart_resume_user",
});

/* =========================================================
   RESUME CONFIGURATION
   ========================================================= */

export const RESUME_CONFIG = Object.freeze({
  defaultTemplate: "classic",

  supportedTemplates: [
    "classic",
    "modern",
    "professional",
  ],

  maxResumesPerUser: 50,

  maxResumeTitleLength: 150,

  maxResumeDataSize: 500000,

  supportedExportFormats: [
    "pdf",
  ],
});

/* =========================================================
   AI CONFIGURATION
   ---------------------------------------------------------
   AI provider selection is controlled through environment
   variables.

   IMPORTANT:
   Never hard-code an AI API key in source code.
   ========================================================= */

export const AI_CONFIG = Object.freeze({
  provider:
    import.meta.env.VITE_AI_PROVIDER ||
    "gemini",

  model:
    import.meta.env.VITE_GEMINI_MODEL ||
    "gemini-2.5-flash",

  enabled:
    import.meta.env.VITE_AI_ENABLED !==
    "false",

  maxOutputTokens: 2048,

  temperature: 0.4,

  requestTimeout: 30000,
});

/* =========================================================
   AI FEATURE FLAGS
   ========================================================= */

export const AI_FEATURES = Object.freeze({
  resumeSuggestions: true,

  grammarImprovement: true,

  actionVerbSuggestions: true,

  industryKeywordSuggestions: true,

  skillGapAnalysis: true,

  achievementImprovement: true,

  contextualInterviewQuestions: true,

  resumeSummaryGeneration: true,

  humanScoreAnalysis: true,

  aiScoreAnalysis: true,
});

/* =========================================================
   APPWRITE CONFIGURATION
   ---------------------------------------------------------
   Actual Appwrite IDs remain in:
   src/services/appwriteConfig.js

   We intentionally do not duplicate them here.
   ========================================================= */

export const APPWRITE_CONFIG = Object.freeze({
  enabled: true,

  endpoint:
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
    "https://cloud.appwrite.io/v1",

  projectId:
    import.meta.env.VITE_APPWRITE_PROJECT_ID ||
    "",

  databaseId:
    import.meta.env.VITE_APPWRITE_DATABASE_ID ||
    "",

  resumeTableId:
    import.meta.env.VITE_APPWRITE_RESUME_TABLE_ID ||
    "resumes",

  storageBucketId:
    import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID ||
    "",
});

/* =========================================================
   FIREBASE CONFIGURATION
   ---------------------------------------------------------
   Firebase is kept for authentication where required.

   Actual Firebase initialization is handled by:
   src/services/firebaseConfig.js
   ========================================================= */

export const FIREBASE_CONFIG = Object.freeze({
  enabled:
    import.meta.env.VITE_FIREBASE_ENABLED !==
    "false",

  authenticationEnabled: true,
});

/* =========================================================
   FILE CONFIGURATION
   ========================================================= */

export const FILE_CONFIG = Object.freeze({
  maxProfileImageSize:
    5 * 1024 * 1024,

  maxCertificateSize:
    10 * 1024 * 1024,

  allowedImageTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],

  allowedDocumentTypes: [
    "application/pdf",
  ],
});

/* =========================================================
   SECURITY CONFIGURATION
   ========================================================= */

export const SECURITY_CONFIG = Object.freeze({
  sanitizeUserInput: true,

  validateExternalURLs: true,

  allowUnsafeHTML: false,

  removeSensitiveLogs: true,

  maxInputLength: 10000,
});

/* =========================================================
   UI CONFIGURATION
   ========================================================= */

export const UI_CONFIG = Object.freeze({
  defaultTheme: "system",

  supportedThemes: [
    "light",
    "dark",
    "system",
  ],

  mobileFirst: true,

  enableAnimations: true,
});

/* =========================================================
   FEATURE FLAGS
   ========================================================= */

export const FEATURES = Object.freeze({
  authentication: true,

  resumeBuilder: true,

  atsAnalysis: true,

  humanScore: true,

  aiScore: true,

  skillGapAnalysis: true,

  githubScoring: true,

  verifiedSkillBadge: true,

  contextualInterview: true,

  templates: true,

  pdfExport: true,

  darkMode: true,

  savedResumes: true,

  fileUpload: true,

  feedback: true,
});

/* =========================================================
   DEVELOPMENT CONFIGURATION
   ========================================================= */

export const DEVELOPMENT_CONFIG =
  Object.freeze({
    enableConsoleLogs:
      IS_DEVELOPMENT,

    enableDebugMode:
      IS_DEVELOPMENT,

    showDevelopmentWarnings:
      IS_DEVELOPMENT,
  });

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const appConfig = Object.freeze({
  APP_CONFIG,

  APP_ROUTES,

  STORAGE_CONFIG,

  RESUME_CONFIG,

  AI_CONFIG,

  AI_FEATURES,

  APPWRITE_CONFIG,

  FIREBASE_CONFIG,

  FILE_CONFIG,

  SECURITY_CONFIG,

  UI_CONFIG,

  FEATURES,

  DEVELOPMENT_CONFIG,

  IS_DEVELOPMENT,

  IS_PRODUCTION,
});

export default appConfig;