// src/services/appwriteService.js

import { databases, DATABASE_ID, RESUMES_TABLE_ID } from "./appwriteConfig";

/* =========================================================
   APPWRITE RESUME SERVICE
   ---------------------------------------------------------
   Responsibilities:
   - Create Resume
   - Get Resume by ID
   - Get Current User's Resumes
   - Update Resume
   - Delete Resume
   - Basic error handling

   Appwrite Database:
   Database ID:
   6a7c79d6003b3e63a916

   Table ID:
   resumes

   Resume columns:
   $id
   userId
   resumeData
   resumeTitle
   template
   $createdAt
   $updatedAt
   ========================================================= */


/* =========================================================
   CONSTANTS
   ========================================================= */

const TABLE_ID = RESUMES_TABLE_ID;


/* =========================================================
   NORMALIZE RESUME DATA
   ---------------------------------------------------------
   Converts resume data into a safe string for Appwrite's
   "resumeData" text column.
   ========================================================= */

const serializeResumeData = (resumeData) => {
  try {
    if (!resumeData) {
      return "{}";
    }

    if (typeof resumeData === "string") {
      return resumeData;
    }

    return JSON.stringify(resumeData);
  } catch (error) {
    console.error(
      "Resume data serialization error:",
      error
    );

    return "{}";
  }
};


/* =========================================================
   PARSE RESUME DATA
   ---------------------------------------------------------
   Converts Appwrite resumeData string back into an object.
   ========================================================= */

const parseResumeData = (resumeData) => {
  try {
    if (!resumeData) {
      return {};
    }

    if (typeof resumeData === "object") {
      return resumeData;
    }

    return JSON.parse(resumeData);
  } catch (error) {
    console.error(
      "Resume data parsing error:",
      error
    );

    return {};
  }
};


/* =========================================================
   CREATE RESUME
   ========================================================= */

export const createResume = async ({
  userId,
  resumeData = {},
  resumeTitle = "Untitled Resume",
  template = "classic",
}) => {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required to create a resume."
      );
    }

    const response =
      await databases.createDocument(
        DATABASE_ID,
        TABLE_ID,
        "unique()",
        {
          userId: String(userId),

          resumeData:
            serializeResumeData(resumeData),

          resumeTitle:
            String(resumeTitle || "Untitled Resume"),

          template:
            String(template || "classic"),
        }
      );

    return {
      success: true,
      data: {
        id: response.$id,
        userId: response.userId,
        resumeData: parseResumeData(
          response.resumeData
        ),
        resumeTitle: response.resumeTitle,
        template: response.template,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt,
      },
    };
  } catch (error) {
    console.error(
      "Create Resume Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to create resume.",
    };
  }
};


/* =========================================================
   GET RESUME BY ID
   ========================================================= */

export const getResumeById = async (
  resumeId
) => {
  try {
    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    const response =
      await databases.getDocument(
        DATABASE_ID,
        TABLE_ID,
        resumeId
      );

    return {
      success: true,
      data: {
        id: response.$id,
        userId: response.userId,
        resumeData: parseResumeData(
          response.resumeData
        ),
        resumeTitle: response.resumeTitle,
        template: response.template,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt,
      },
    };
  } catch (error) {
    console.error(
      "Get Resume Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to load resume.",
    };
  }
};


/* =========================================================
   GET USER RESUMES
   ---------------------------------------------------------
   Returns all resumes belonging to one user.

   NOTE:
   We intentionally do not require an Appwrite index here
   for the first working version.
   ========================================================= */

export const getUserResumes = async (
  userId
) => {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    const response =
      await databases.listDocuments(
        DATABASE_ID,
        TABLE_ID
      );

    const userDocuments =
      response.documents.filter(
        (document) =>
          document.userId === String(userId)
      );

    const resumes =
      userDocuments.map((document) => ({
        id: document.$id,

        userId: document.userId,

        resumeData: parseResumeData(
          document.resumeData
        ),

        resumeTitle:
          document.resumeTitle ||
          "Untitled Resume",

        template:
          document.template ||
          "classic",

        createdAt:
          document.$createdAt,

        updatedAt:
          document.$updatedAt,
      }));

    return {
      success: true,
      data: resumes,
    };
  } catch (error) {
    console.error(
      "Get User Resumes Error:",
      error
    );

    return {
      success: false,
      data: [],
      error:
        error?.message ||
        "Failed to load user resumes.",
    };
  }
};


/* =========================================================
   UPDATE RESUME
   ========================================================= */

export const updateResume = async ({
  resumeId,
  resumeData,
  resumeTitle,
  template,
}) => {
  try {
    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    const updateData = {};


    /* -------------------------------------------------------
       RESUME DATA
       ------------------------------------------------------- */

    if (resumeData !== undefined) {
      updateData.resumeData =
        serializeResumeData(
          resumeData
        );
    }


    /* -------------------------------------------------------
       RESUME TITLE
       ------------------------------------------------------- */

    if (resumeTitle !== undefined) {
      updateData.resumeTitle =
        String(
          resumeTitle ||
            "Untitled Resume"
        );
    }


    /* -------------------------------------------------------
       TEMPLATE
       ------------------------------------------------------- */

    if (template !== undefined) {
      updateData.template =
        String(
          template || "classic"
        );
    }


    /* -------------------------------------------------------
       NOTHING TO UPDATE
       ------------------------------------------------------- */

    if (
      Object.keys(updateData).length === 0
    ) {
      throw new Error(
        "No resume information was provided for update."
      );
    }


    const response =
      await databases.updateDocument(
        DATABASE_ID,
        TABLE_ID,
        resumeId,
        updateData
      );


    return {
      success: true,
      data: {
        id: response.$id,

        userId:
          response.userId,

        resumeData:
          parseResumeData(
            response.resumeData
          ),

        resumeTitle:
          response.resumeTitle,

        template:
          response.template,

        createdAt:
          response.$createdAt,

        updatedAt:
          response.$updatedAt,
      },
    };
  } catch (error) {
    console.error(
      "Update Resume Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to update resume.",
    };
  }
};


/* =========================================================
   DELETE RESUME
   ========================================================= */

export const deleteResume = async (
  resumeId
) => {
  try {
    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    await databases.deleteDocument(
      DATABASE_ID,
      TABLE_ID,
      resumeId
    );

    return {
      success: true,
      message:
        "Resume deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete Resume Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to delete resume.",
    };
  }
};


/* =========================================================
   CHECK RESUME OWNER
   ---------------------------------------------------------
   Used before allowing edit/delete operations.
   ========================================================= */

export const isResumeOwner = async ({
  resumeId,
  userId,
}) => {
  try {
    if (!resumeId || !userId) {
      return false;
    }

    const result =
      await getResumeById(
        resumeId
      );

    if (!result.success) {
      return false;
    }

    return (
      result.data.userId ===
      String(userId)
    );
  } catch (error) {
    console.error(
      "Resume Owner Check Error:",
      error
    );

    return false;
  }
};


/* =========================================================
   DUPLICATE RESUME
   ---------------------------------------------------------
   Useful for "Save as Copy" / Resume versions.
   ========================================================= */

export const duplicateResume = async ({
  resumeId,
  userId,
  newTitle,
}) => {
  try {
    if (!resumeId || !userId) {
      throw new Error(
        "Resume ID and User ID are required."
      );
    }

    const original =
      await getResumeById(
        resumeId
      );

    if (!original.success) {
      throw new Error(
        original.error ||
          "Original resume could not be loaded."
      );
    }

    if (
      original.data.userId !==
      String(userId)
    ) {
      throw new Error(
        "You are not allowed to duplicate this resume."
      );
    }

    return await createResume({
      userId,

      resumeData:
        original.data.resumeData,

      resumeTitle:
        newTitle ||
        `${original.data.resumeTitle} Copy`,

      template:
        original.data.template ||
        "classic",
    });
  } catch (error) {
    console.error(
      "Duplicate Resume Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Failed to duplicate resume.",
    };
  }
};


/* =========================================================
   EXPORT DEFAULT SERVICE OBJECT
   ---------------------------------------------------------
   Allows either:
      import { createResume }
   OR:
      import resumeService
   ========================================================= */

const resumeService = {
  createResume,
  getResumeById,
  getUserResumes,
  updateResume,
  deleteResume,
  isResumeOwner,
  duplicateResume,
};

export default resumeService;