// src/services/appwriteStorage.js

import {
  storage,
  STORAGE_BUCKET_ID,
} from "./appwriteConfig";

/* =========================================================
   SMART RESUME BUILDER
   APPWRITE STORAGE SERVICE
   ---------------------------------------------------------
   Bucket:
   resume-files

   Bucket ID:
   6a7928d9002ee7f7f7ea

   Handles:
   - Profile Photo Upload
   - Certificate Upload
   - General File Upload
   - File Preview URL
   - File Download URL
   - File Delete
   - File Information
   - Error Handling
   ========================================================= */


/* =========================================================
   CONSTANT
   ========================================================= */

const BUCKET_ID =
  STORAGE_BUCKET_ID ||
  "6a7928d9002ee7f7f7ea";


/* =========================================================
   FILE VALIDATION
   ========================================================= */

const validateFile = (
  file,
  options = {}
) => {
  const {
    maxSizeMB = 10,
    allowedTypes = [],
  } = options;

  if (!file) {
    return {
      valid: false,
      error: "Please select a file.",
    };
  }

  /* -------------------------------------------------------
     SIZE CHECK
     ------------------------------------------------------- */

  const maxSize =
    maxSizeMB * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB} MB.`,
    };
  }

  /* -------------------------------------------------------
     TYPE CHECK
     ------------------------------------------------------- */

  if (
    allowedTypes.length > 0 &&
    !allowedTypes.includes(file.type)
  ) {
    return {
      valid: false,
      error:
        "This file type is not supported.",
    };
  }

  return {
    valid: true,
  };
};


/* =========================================================
   UPLOAD FILE
   ---------------------------------------------------------
   Generic file upload function.
   ========================================================= */

export const uploadFile = async (
  file,
  options = {}
) => {
  try {
    const validation =
      validateFile(
        file,
        options
      );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const response =
      await storage.createFile(
        BUCKET_ID,
        "unique()",
        file
      );

    const fileId =
      response.$id;

    return {
      success: true,

      data: {
        fileId,

        name:
          response.name,

        mimeType:
          response.mimeType,

        size:
          response.sizeOriginal,

        bucketId:
          BUCKET_ID,

        previewUrl:
          getFilePreviewUrl(
            fileId
          ),

        viewUrl:
          getFileViewUrl(
            fileId
          ),

        downloadUrl:
          getFileDownloadUrl(
            fileId
          ),
      },

      message:
        "File uploaded successfully.",
    };
  } catch (error) {
    console.error(
      "Appwrite File Upload Error:",
      error
    );

    return {
      success: false,
      error:
        getStorageErrorMessage(
          error
        ),
    };
  }
};


/* =========================================================
   UPLOAD PROFILE PHOTO
   ---------------------------------------------------------
   Allowed:
   - JPEG
   - JPG
   - PNG
   - WEBP

   Maximum:
   5 MB
   ========================================================= */

export const uploadProfilePhoto =
  async (file) => {
    return uploadFile(
      file,
      {
        maxSizeMB: 5,

        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
      }
    );
  };


/* =========================================================
   UPLOAD CERTIFICATE
   ---------------------------------------------------------
   Allowed:
   - JPEG
   - PNG
   - WEBP
   - PDF

   Maximum:
   10 MB
   ========================================================= */

export const uploadCertificate =
  async (file) => {
    return uploadFile(
      file,
      {
        maxSizeMB: 10,

        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
        ],
      }
    );
  };


/* =========================================================
   GET FILE PREVIEW URL
   ---------------------------------------------------------
   Used for images.
   ========================================================= */

export const getFilePreviewUrl = (
  fileId,
  width = 800,
  height = 800
) => {
  if (!fileId) {
    return "";
  }

  try {
    return storage.getFilePreview(
      BUCKET_ID,
      fileId,
      width,
      height
    );
  } catch (error) {
    console.error(
      "File Preview URL Error:",
      error
    );

    return "";
  }
};


/* =========================================================
   GET FILE VIEW URL
   ---------------------------------------------------------
   Useful for:
   - PDF
   - Image
   - Browser preview
   ========================================================= */

export const getFileViewUrl = (
  fileId
) => {
  if (!fileId) {
    return "";
  }

  try {
    return storage.getFileView(
      BUCKET_ID,
      fileId
    );
  } catch (error) {
    console.error(
      "File View URL Error:",
      error
    );

    return "";
  }
};


/* =========================================================
   GET FILE DOWNLOAD URL
   ========================================================= */

export const getFileDownloadUrl = (
  fileId
) => {
  if (!fileId) {
    return "";
  }

  try {
    return storage.getFileDownload(
      BUCKET_ID,
      fileId
    );
  } catch (error) {
    console.error(
      "File Download URL Error:",
      error
    );

    return "";
  }
};


/* =========================================================
   GET FILE INFORMATION
   ========================================================= */

export const getFileInfo = async (
  fileId
) => {
  try {
    if (!fileId) {
      return {
        success: false,
        error:
          "File ID is required.",
      };
    }

    const response =
      await storage.getFile(
        BUCKET_ID,
        fileId
      );

    return {
      success: true,

      data: {
        fileId:
          response.$id,

        name:
          response.name,

        mimeType:
          response.mimeType,

        size:
          response.sizeOriginal,

        bucketId:
          BUCKET_ID,

        createdAt:
          response.$createdAt,

        updatedAt:
          response.$updatedAt,

        previewUrl:
          getFilePreviewUrl(
            response.$id
          ),

        viewUrl:
          getFileViewUrl(
            response.$id
          ),

        downloadUrl:
          getFileDownloadUrl(
            response.$id
          ),
      },
    };
  } catch (error) {
    console.error(
      "Get File Information Error:",
      error
    );

    return {
      success: false,
      error:
        getStorageErrorMessage(
          error
        ),
    };
  }
};


/* =========================================================
   DELETE FILE
   ========================================================= */

export const deleteFile = async (
  fileId
) => {
  try {
    if (!fileId) {
      return {
        success: false,
        error:
          "File ID is required.",
      };
    }

    await storage.deleteFile(
      BUCKET_ID,
      fileId
    );

    return {
      success: true,
      message:
        "File deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete File Error:",
      error
    );

    return {
      success: false,
      error:
        getStorageErrorMessage(
          error
        ),
    };
  }
};


/* =========================================================
   DELETE FILE SAFELY
   ---------------------------------------------------------
   Useful when deleting an old profile photo or certificate.
   ========================================================= */

export const deleteFileSafely =
  async (fileId) => {
    try {
      if (!fileId) {
        return {
          success: true,
        };
      }

      await storage.deleteFile(
        BUCKET_ID,
        fileId
      );

      return {
        success: true,
      };
    } catch (error) {
      console.warn(
        "Safe file deletion warning:",
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          "Unable to delete file.",
      };
    }
  };


/* =========================================================
   UPLOAD AND RETURN COMPLETE FILE DATA
   ========================================================= */

export const uploadResumeFile =
  async (
    file,
    type = "general"
  ) => {
    try {
      let options = {
        maxSizeMB: 10,
        allowedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
        ],
      };

      /* -----------------------------------------------------
         PROFILE PHOTO
         ----------------------------------------------------- */

      if (
        type ===
        "profile"
      ) {
        options = {
          maxSizeMB: 5,

          allowedTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
        };
      }

      /* -----------------------------------------------------
         CERTIFICATE
         ----------------------------------------------------- */

      if (
        type ===
        "certificate"
      ) {
        options = {
          maxSizeMB: 10,

          allowedTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
          ],
        };
      }

      const result =
        await uploadFile(
          file,
          options
        );

      return result;
    } catch (error) {
      console.error(
        "Resume File Upload Error:",
        error
      );

      return {
        success: false,
        error:
          getStorageErrorMessage(
            error
          ),
      };
    }
  };


/* =========================================================
   FILE TYPE HELPERS
   ========================================================= */

export const isImageFile = (
  file
) => {
  if (!file) {
    return false;
  }

  return file.type.startsWith(
    "image/"
  );
};


export const isPDFFile = (
  file
) => {
  if (!file) {
    return false;
  }

  return (
    file.type ===
    "application/pdf"
  );
};


/* =========================================================
   FILE SIZE FORMATTER
   ========================================================= */

export const formatFileSize = (
  bytes
) => {
  if (
    !bytes ||
    bytes <= 0
  ) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  const size =
    bytes /
    Math.pow(
      1024,
      index
    );

  return `${size.toFixed(
    2
  )} ${units[index]}`;
};


/* =========================================================
   STORAGE ERROR HANDLER
   ========================================================= */

const getStorageErrorMessage =
  (error) => {
    const message =
      String(
        error?.message ||
          ""
      ).toLowerCase();

    const code =
      error?.code;


    /* -------------------------------------------------------
       FILE NOT FOUND
       ------------------------------------------------------- */

    if (
      code === 404 ||
      message.includes(
        "not found"
      )
    ) {
      return "The requested file was not found.";
    }


    /* -------------------------------------------------------
       PERMISSION
       ------------------------------------------------------- */

    if (
      code === 401 ||
      code === 403 ||
      message.includes(
        "permission"
      ) ||
      message.includes(
        "unauthorized"
      )
    ) {
      return "You do not have permission to access this file.";
    }


    /* -------------------------------------------------------
       FILE TOO LARGE
       ------------------------------------------------------- */

    if (
      message.includes(
        "size"
      ) &&
      message.includes(
        "large"
      )
    ) {
      return "The selected file is too large.";
    }


    /* -------------------------------------------------------
       NETWORK
       ------------------------------------------------------- */

    if (
      message.includes(
        "network"
      ) ||
      message.includes(
        "failed to fetch"
      )
    ) {
      return "Network error. Please check your internet connection.";
    }


    /* -------------------------------------------------------
       DEFAULT
       ------------------------------------------------------- */

    return (
      error?.message ||
      "File storage operation failed."
    );
  };


/* =========================================================
   DEFAULT STORAGE SERVICE
   ========================================================= */

const appwriteStorage = {
  uploadFile,

  uploadProfilePhoto,
  uploadCertificate,
  uploadResumeFile,

  getFilePreviewUrl,
  getFileViewUrl,
  getFileDownloadUrl,

  getFileInfo,

  deleteFile,
  deleteFileSafely,

  isImageFile,
  isPDFFile,

  formatFileSize,
};


export default appwriteStorage;