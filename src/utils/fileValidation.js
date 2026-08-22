// src/utils/fileValidation.js

/* =========================================================
   SMART RESUME BUILDER
   FILE VALIDATION UTILITY
   ---------------------------------------------------------
   Purpose:
   - Validate uploaded files
   - Validate file type
   - Validate file extension
   - Validate file size
   - Profile photo validation
   - Certificate validation
   - Resume/document validation
   - Prevent unsupported files
   - Provide user-friendly validation messages
   ========================================================= */

/* =========================================================
   FILE SIZE LIMITS
   ---------------------------------------------------------
   Values are in bytes.
   ========================================================= */

export const FILE_SIZE_LIMITS = Object.freeze({
  PROFILE_IMAGE: 2 * 1024 * 1024, // 2 MB

  CERTIFICATE_IMAGE: 5 * 1024 * 1024, // 5 MB

  DOCUMENT: 10 * 1024 * 1024, // 10 MB

  PDF: 10 * 1024 * 1024, // 10 MB

  GENERAL: 10 * 1024 * 1024, // 10 MB
});

/* =========================================================
   ALLOWED MIME TYPES
   ========================================================= */

export const ALLOWED_FILE_TYPES = Object.freeze({
  IMAGES: Object.freeze([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]),

  DOCUMENTS: Object.freeze([
    "application/pdf",
  ]),

  CERTIFICATES: Object.freeze([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]),
});

/* =========================================================
   ALLOWED EXTENSIONS
   ========================================================= */

export const ALLOWED_EXTENSIONS = Object.freeze({
  IMAGES: Object.freeze([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ]),

  DOCUMENTS: Object.freeze([
    ".pdf",
  ]),

  CERTIFICATES: Object.freeze([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
  ]),
});

/* =========================================================
   ERROR TYPES
   ========================================================= */

export const FILE_ERROR_TYPES = Object.freeze({
  REQUIRED: "FILE_REQUIRED",

  INVALID_FILE: "INVALID_FILE",

  INVALID_TYPE: "INVALID_FILE_TYPE",

  INVALID_EXTENSION: "INVALID_FILE_EXTENSION",

  FILE_TOO_LARGE: "FILE_TOO_LARGE",

  FILE_TOO_SMALL: "FILE_TOO_SMALL",

  EMPTY_FILE: "EMPTY_FILE",

  UNKNOWN: "UNKNOWN_FILE_ERROR",
});

/* =========================================================
   SAFE STRING
   ========================================================= */

const safeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  try {
    return String(value).trim();
  } catch {
    return "";
  }
};

/* =========================================================
   GET FILE EXTENSION
   ========================================================= */

export const getFileExtension = (file) => {
  if (!file) {
    return "";
  }

  const fileName = safeString(file.name);

  if (!fileName) {
    return "";
  }

  const lastDotIndex = fileName.lastIndexOf(".");

  if (
    lastDotIndex === -1 ||
    lastDotIndex === fileName.length - 1
  ) {
    return "";
  }

  return fileName
    .substring(lastDotIndex)
    .toLowerCase();
};

/* =========================================================
   GET FILE SIZE IN MB
   ========================================================= */

export const getFileSizeInMB = (file) => {
  if (!file || typeof file.size !== "number") {
    return 0;
  }

  return file.size / (1024 * 1024);
};

/* =========================================================
   FORMAT FILE SIZE
   ========================================================= */

export const formatFileSize = (bytes) => {
  if (
    typeof bytes !== "number" ||
    !Number.isFinite(bytes) ||
    bytes < 0
  ) {
    return "0 Bytes";
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const safeIndex = Math.min(
    index,
    units.length - 1
  );

  const value =
    bytes / Math.pow(1024, safeIndex);

  return `${Number(value.toFixed(2))} ${units[safeIndex]}`;
};

/* =========================================================
   CHECK FILE OBJECT
   ========================================================= */

export const isValidFileObject = (file) => {
  if (!file) {
    return false;
  }

  if (
    typeof file !== "object" ||
    typeof file.name !== "string" ||
    typeof file.size !== "number"
  ) {
    return false;
  }

  return true;
};

/* =========================================================
   CHECK EMPTY FILE
   ========================================================= */

export const isEmptyFile = (file) => {
  if (!file) {
    return true;
  }

  return file.size === 0;
};

/* =========================================================
   CHECK MIME TYPE
   ========================================================= */

export const isAllowedMimeType = (
  file,
  allowedTypes = []
) => {
  if (!file) {
    return false;
  }

  const fileType =
    safeString(file.type).toLowerCase();

  if (!fileType) {
    return false;
  }

  return allowedTypes.some(
    (allowedType) =>
      safeString(allowedType).toLowerCase() ===
      fileType
  );
};

/* =========================================================
   CHECK EXTENSION
   ========================================================= */

export const isAllowedExtension = (
  file,
  allowedExtensions = []
) => {
  if (!file) {
    return false;
  }

  const extension =
    getFileExtension(file);

  if (!extension) {
    return false;
  }

  return allowedExtensions.some(
    (allowedExtension) =>
      safeString(allowedExtension)
        .toLowerCase() === extension
  );
};

/* =========================================================
   CHECK FILE SIZE
   ========================================================= */

export const isFileSizeAllowed = (
  file,
  maxSize
) => {
  if (!file) {
    return false;
  }

  if (
    typeof file.size !== "number" ||
    typeof maxSize !== "number"
  ) {
    return false;
  }

  return (
    file.size > 0 &&
    file.size <= maxSize
  );
};

/* =========================================================
   GENERIC FILE VALIDATOR
   ========================================================= */

export const validateFile = (
  file,
  options = {}
) => {
  const {
    required = true,

    allowedTypes = [],

    allowedExtensions = [],

    maxSize = FILE_SIZE_LIMITS.GENERAL,

    minSize = 1,

    fieldName = "File",
  } = options;

  /* -------------------------------------------------------
     Required validation
     ------------------------------------------------------- */

  if (!file) {
    if (!required) {
      return {
        valid: true,
        error: null,
        type: null,
      };
    }

    return {
      valid: false,
      error: `${fieldName} is required.`,
      type: FILE_ERROR_TYPES.REQUIRED,
    };
  }

  /* -------------------------------------------------------
     File object validation
     ------------------------------------------------------- */

  if (!isValidFileObject(file)) {
    return {
      valid: false,
      error: `${fieldName} is not a valid file.`,
      type: FILE_ERROR_TYPES.INVALID_FILE,
    };
  }

  /* -------------------------------------------------------
     Empty file validation
     ------------------------------------------------------- */

  if (isEmptyFile(file)) {
    return {
      valid: false,
      error: `${fieldName} is empty.`,
      type: FILE_ERROR_TYPES.EMPTY_FILE,
    };
  }

  /* -------------------------------------------------------
     Minimum size
     ------------------------------------------------------- */

  if (
    typeof minSize === "number" &&
    file.size < minSize
  ) {
    return {
      valid: false,
      error: `${fieldName} is too small.`,
      type: FILE_ERROR_TYPES.FILE_TOO_SMALL,
    };
  }

  /* -------------------------------------------------------
     Maximum size
     ------------------------------------------------------- */

  if (
    typeof maxSize === "number" &&
    file.size > maxSize
  ) {
    return {
      valid: false,
      error: `${fieldName} is too large. Maximum allowed size is ${formatFileSize(
        maxSize
      )}.`,
      type: FILE_ERROR_TYPES.FILE_TOO_LARGE,
    };
  }

  /* -------------------------------------------------------
     MIME type validation
     ------------------------------------------------------- */

  if (
    allowedTypes.length > 0 &&
    !isAllowedMimeType(
      file,
      allowedTypes
    )
  ) {
    return {
      valid: false,
      error: `${fieldName} has an unsupported file type.`,
      type: FILE_ERROR_TYPES.INVALID_TYPE,
    };
  }

  /* -------------------------------------------------------
     Extension validation
     ------------------------------------------------------- */

  if (
    allowedExtensions.length > 0 &&
    !isAllowedExtension(
      file,
      allowedExtensions
    )
  ) {
    return {
      valid: false,
      error: `${fieldName} has an unsupported file extension.`,
      type: FILE_ERROR_TYPES.INVALID_EXTENSION,
    };
  }

  /* -------------------------------------------------------
     Success
     ------------------------------------------------------- */

  return {
    valid: true,
    error: null,
    type: null,

    file: {
      name: file.name,
      type: file.type || null,
      size: file.size,
      sizeFormatted:
        formatFileSize(file.size),
      extension:
        getFileExtension(file),
    },
  };
};

/* =========================================================
   PROFILE PHOTO VALIDATION
   ---------------------------------------------------------
   Allowed:
   JPG
   JPEG
   PNG
   WEBP

   Maximum:
   2 MB
   ========================================================= */

export const validateProfilePhoto = (
  file
) => {
  return validateFile(file, {
    required: true,

    allowedTypes:
      ALLOWED_FILE_TYPES.IMAGES,

    allowedExtensions:
      ALLOWED_EXTENSIONS.IMAGES,

    maxSize:
      FILE_SIZE_LIMITS.PROFILE_IMAGE,

    minSize: 1,

    fieldName: "Profile photo",
  });
};

/* =========================================================
   CERTIFICATE VALIDATION
   ---------------------------------------------------------
   Allowed:
   JPG
   JPEG
   PNG
   WEBP
   PDF

   Maximum:
   5 MB
   ========================================================= */

export const validateCertificate = (
  file
) => {
  return validateFile(file, {
    required: true,

    allowedTypes:
      ALLOWED_FILE_TYPES.CERTIFICATES,

    allowedExtensions:
      ALLOWED_EXTENSIONS.CERTIFICATES,

    maxSize:
      FILE_SIZE_LIMITS.CERTIFICATE_IMAGE,

    minSize: 1,

    fieldName: "Certificate",
  });
};

/* =========================================================
   PDF VALIDATION
   ========================================================= */

export const validatePDF = (file) => {
  return validateFile(file, {
    required: true,

    allowedTypes:
      ALLOWED_FILE_TYPES.DOCUMENTS,

    allowedExtensions:
      ALLOWED_EXTENSIONS.DOCUMENTS,

    maxSize:
      FILE_SIZE_LIMITS.PDF,

    minSize: 1,

    fieldName: "PDF file",
  });
};

/* =========================================================
   DOCUMENT VALIDATION
   ========================================================= */

export const validateDocument = (
  file
) => {
  return validateFile(file, {
    required: true,

    allowedTypes:
      ALLOWED_FILE_TYPES.DOCUMENTS,

    allowedExtensions:
      ALLOWED_EXTENSIONS.DOCUMENTS,

    maxSize:
      FILE_SIZE_LIMITS.DOCUMENT,

    minSize: 1,

    fieldName: "Document",
  });
};

/* =========================================================
   GENERAL IMAGE VALIDATION
   ========================================================= */

export const validateImage = (file) => {
  return validateFile(file, {
    required: true,

    allowedTypes:
      ALLOWED_FILE_TYPES.IMAGES,

    allowedExtensions:
      ALLOWED_EXTENSIONS.IMAGES,

    maxSize:
      FILE_SIZE_LIMITS.CERTIFICATE_IMAGE,

    minSize: 1,

    fieldName: "Image",
  });
};

/* =========================================================
   MULTIPLE FILE VALIDATION
   ========================================================= */

export const validateMultipleFiles = (
  files,
  validator = validateFile
) => {
  if (!files) {
    return {
      valid: false,
      error: "No files provided.",
      results: [],
    };
  }

  const fileArray =
    Array.from(files);

  if (fileArray.length === 0) {
    return {
      valid: false,
      error: "No files selected.",
      results: [],
    };
  }

  const results =
    fileArray.map((file) =>
      validator(file)
    );

  const invalidFiles =
    results.filter(
      (result) => !result.valid
    );

  return {
    valid:
      invalidFiles.length === 0,

    error:
      invalidFiles.length > 0
        ? invalidFiles[0].error
        : null,

    results,
  };
};

/* =========================================================
   CREATE FILE INPUT ACCEPT VALUE
   ========================================================= */

export const getImageAcceptAttribute = () => {
  return ALLOWED_EXTENSIONS.IMAGES.join(",");
};

export const getCertificateAcceptAttribute =
  () => {
    return ALLOWED_EXTENSIONS.CERTIFICATES.join(
      ","
    );
  };

export const getPdfAcceptAttribute = () => {
  return ALLOWED_EXTENSIONS.DOCUMENTS.join(
    ","
  );
};

/* =========================================================
   SECURITY CHECK
   ---------------------------------------------------------
   Reject suspicious filenames.
   ========================================================= */

export const hasSuspiciousFileName = (
  file
) => {
  if (!file || !file.name) {
    return true;
  }

  const fileName =
    safeString(file.name)
      .toLowerCase();

  const suspiciousPatterns = [
    "..",
    "/",
    "\\",
    "<",
    ">",
    ":",
    '"',
    "|",
    "?",
    "*",
  ];

  return suspiciousPatterns.some(
    (pattern) =>
      fileName.includes(pattern)
  );
};

/* =========================================================
   SAFE FILE NAME
   ---------------------------------------------------------
   Creates a safer display/storage filename.
   ========================================================= */

export const sanitizeFileName = (
  fileName
) => {
  const name =
    safeString(fileName);

  if (!name) {
    return "uploaded-file";
  }

  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 180);
};

/* =========================================================
   COMPLETE SECURITY VALIDATION
   ========================================================= */

export const validateFileSecurity = (
  file
) => {
  if (!isValidFileObject(file)) {
    return {
      valid: false,
      error: "Invalid file.",
      type: FILE_ERROR_TYPES.INVALID_FILE,
    };
  }

  if (hasSuspiciousFileName(file)) {
    return {
      valid: false,
      error:
        "The selected filename contains unsupported characters.",
      type: FILE_ERROR_TYPES.INVALID_FILE,
    };
  }

  return {
    valid: true,
    error: null,
    type: null,
  };
};

/* =========================================================
   FINAL VALIDATION
   ---------------------------------------------------------
   Combines normal validation + security validation.
   ========================================================= */

export const validateUploadedFile = (
  file,
  options = {}
) => {
  const securityResult =
    validateFileSecurity(file);

  if (!securityResult.valid) {
    return securityResult;
  }

  return validateFile(
    file,
    options
  );
};

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const fileValidation = {
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  FILE_ERROR_TYPES,

  getFileExtension,
  getFileSizeInMB,
  formatFileSize,

  isValidFileObject,
  isEmptyFile,
  isAllowedMimeType,
  isAllowedExtension,
  isFileSizeAllowed,

  validateFile,
  validateProfilePhoto,
  validateCertificate,
  validatePDF,
  validateDocument,
  validateImage,
  validateMultipleFiles,

  getImageAcceptAttribute,
  getCertificateAcceptAttribute,
  getPdfAcceptAttribute,

  hasSuspiciousFileName,
  sanitizeFileName,
  validateFileSecurity,
  validateUploadedFile,
};

export default fileValidation;