// src/services/appwriteResumeService.js

import {
  database,
  DATABASE_ID,
  TABLE_ID,
} from "./appwriteConfig";

/* =========================================================
   SMART RESUME BUILDER
   APPWRITE RESUME DATABASE SERVICE
   ---------------------------------------------------------
   Appwrite SDK:
   26.2.0

   Handles:
   - Create Resume
   - Get Single Resume
   - Get User Resumes
   - Update Resume
   - Delete Resume
   - Check Resume Exists
   - Normalize Resume Data

   Appwrite Table:
   resumes

   Columns:
   - $id
   - userId
   - resumeData
   - resumeTitle
   - template
   - $createdAt
   - $updatedAt
   ========================================================= */

/* =========================================================
   CONSTANTS
   ========================================================= */

const DATABASE = DATABASE_ID;
const TABLE = TABLE_ID;

/* =========================================================
   HELPER
   Convert Resume Data into a safe JSON string
   ========================================================= */

const serializeResumeData = (resumeData) => {
  if (typeof resumeData === "string") {
    return resumeData;
  }

  try {
    return JSON.stringify(resumeData ?? {});
  } catch (error) {
    console.error(
      "Resume Data Serialization Error:",
      error
    );

    throw new Error(
      "Resume data could not be converted to JSON."
    );
  }
};

/* =========================================================
   HELPER
   Convert JSON string back into an object
   ========================================================= */

const parseResumeData = (resumeData) => {
  if (!resumeData) {
    return {};
  }

  if (typeof resumeData !== "string") {
    return resumeData;
  }

  try {
    return JSON.parse(resumeData);
  } catch (error) {
    console.error(
      "Resume Data JSON Parse Error:",
      error
    );

    return {};
  }
};

/* =========================================================
   HELPER
   NORMALIZE APPWRITE ROW
   ========================================================= */

const normalizeResume = (row) => {
  if (!row) {
    return null;
  }

  const parsedResumeData =
    parseResumeData(row.resumeData);

  return {
    id: row.$id,

    userId:
      row.userId || null,

    resumeTitle:
      row.resumeTitle ||
      "Untitled Resume",

    template:
      row.template ||
      "classic",

    resumeData:
      parsedResumeData,

    createdAt:
      row.$createdAt || null,

    updatedAt:
      row.$updatedAt || null,

    /*
     * Spread resume fields so existing
     * Resume Builder components can access
     * profile information directly.
     */
    ...(typeof parsedResumeData === "object" &&
    parsedResumeData !== null
      ? parsedResumeData
      : {}),
  };
};

/* =========================================================
   CREATE RESUME
   ========================================================= */

export const createResume = async ({
  userId,
  resumeData,
  resumeTitle = "Untitled Resume",
  template = "classic",
}) => {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    if (
      resumeData === undefined ||
      resumeData === null
    ) {
      throw new Error(
        "Resume data is required."
      );
    }

    const response =
      await database.createRow({
        databaseId: DATABASE,
        tableId: TABLE,

        /*
         * Appwrite generates a unique row ID.
         */
        rowId: "unique()",

        data: {
          userId: String(userId),

          resumeData:
            serializeResumeData(
              resumeData
            ),

          resumeTitle:
            String(resumeTitle),

          template:
            String(template),
        },
      });

    return {
      success: true,
      data: normalizeResume(response),
      id: response.$id,
    };
  } catch (error) {
    console.error(
      "Appwrite Create Resume Error:",
      error
    );

    return {
      success: false,
      data: null,
      id: null,
      error:
        error?.message ||
        "Unable to create resume.",
    };
  }
};

/* =========================================================
   GET SINGLE RESUME
   ========================================================= */

export const getResume = async (
  resumeId
) => {
  try {
    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    const response =
      await database.getRow({
        databaseId: DATABASE,
        tableId: TABLE,
        rowId: String(resumeId),
      });

    return {
      success: true,
      data: normalizeResume(response),
    };
  } catch (error) {
    console.error(
      "Appwrite Get Resume Error:",
      error
    );

    return {
      success: false,
      data: null,
      error:
        error?.message ||
        "Unable to load resume.",
    };
  }
};

/* =========================================================
   GET ALL RESUMES FOR A USER
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

    /*
     * Appwrite TablesDB query.
     *
     * The Query helper is imported dynamically below
     * so this service remains compatible with the
     * current configuration structure.
     */

    const { Query } = await import(
      "appwrite"
    );

    const response =
      await database.listRows({
        databaseId: DATABASE,
        tableId: TABLE,

        queries: [
          Query.equal(
            "userId",
            String(userId)
          ),

          Query.orderDesc(
            "$createdAt"
          ),
        ],

        total: false,
      });

    const rows =
      Array.isArray(response.rows)
        ? response.rows
        : [];

    return {
      success: true,

      data: rows.map(
        normalizeResume
      ),

      total: rows.length,
    };
  } catch (error) {
    console.error(
      "Appwrite Get User Resumes Error:",
      error
    );

    return {
      success: false,
      data: [],
      total: 0,
      error:
        error?.message ||
        "Unable to load user resumes.",
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

    /* -----------------------------------------
       Resume Data
       ----------------------------------------- */

    if (
      resumeData !== undefined
    ) {
      updateData.resumeData =
        serializeResumeData(
          resumeData
        );
    }

    /* -----------------------------------------
       Resume Title
       ----------------------------------------- */

    if (
      resumeTitle !== undefined
    ) {
      updateData.resumeTitle =
        String(resumeTitle);
    }

    /* -----------------------------------------
       Template
       ----------------------------------------- */

    if (
      template !== undefined
    ) {
      updateData.template =
        String(template);
    }

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      throw new Error(
        "No resume data provided for update."
      );
    }

    const response =
      await database.updateRow({
        databaseId: DATABASE,
        tableId: TABLE,
        rowId: String(resumeId),
        data: updateData,
      });

    return {
      success: true,
      data: normalizeResume(response),
    };
  } catch (error) {
    console.error(
      "Appwrite Update Resume Error:",
      error
    );

    return {
      success: false,
      data: null,
      error:
        error?.message ||
        "Unable to update resume.",
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

    await database.deleteRow({
      databaseId: DATABASE,
      tableId: TABLE,
      rowId: String(resumeId),
    });

    return {
      success: true,
      message:
        "Resume deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Appwrite Delete Resume Error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Unable to delete resume.",
    };
  }
};

/* =========================================================
   CHECK WHETHER RESUME EXISTS
   ========================================================= */

export const resumeExists = async (
  resumeId
) => {
  try {
    if (!resumeId) {
      return false;
    }

    await database.getRow({
      databaseId: DATABASE,
      tableId: TABLE,
      rowId: String(resumeId),
    });

    return true;
  } catch (error) {
    return false;
  }
};

/* =========================================================
   GET USER RESUME COUNT
   ========================================================= */

export const getUserResumeCount =
  async (userId) => {
    try {
      if (!userId) {
        return 0;
      }

      const { Query } = await import(
        "appwrite"
      );

      const response =
        await database.listRows({
          databaseId: DATABASE,
          tableId: TABLE,

          queries: [
            Query.equal(
              "userId",
              String(userId)
            ),
          ],

          total: true,
        });

      return (
        Number(response.total) || 0
      );
    } catch (error) {
      console.error(
        "Appwrite Resume Count Error:",
        error
      );

      return 0;
    }
  };

/* =========================================================
   DEFAULT SERVICE EXPORT
   ========================================================= */

const appwriteResumeService = {
  createResume,
  getResume,
  getUserResumes,
  updateResume,
  deleteResume,
  resumeExists,
  getUserResumeCount,
};

export default appwriteResumeService;