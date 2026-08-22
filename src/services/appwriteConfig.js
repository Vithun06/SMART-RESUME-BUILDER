/* =========================================================
   SMART RESUME BUILDER
   APPWRITE CONFIGURATION
   ---------------------------------------------------------
   Appwrite SDK: 26.2.0

   Purpose:
   - Central Appwrite configuration
   - Appwrite Client
   - TablesDB service
   - Database ID
   - Resume table ID
   - Storage bucket ID

   IMPORTANT:
   - No API Secret is stored here.
   - No password is stored here.
   - Client-side Appwrite identifiers are safe to expose.
   ========================================================= */

import { Client, TablesDB } from "appwrite";

/* =========================================================
   APPWRITE PROJECT CONFIGURATION
   ========================================================= */

export const APPWRITE_ENDPOINT =
  "https://cloud.appwrite.io/v1";

export const APPWRITE_PROJECT_ID =
  "6a7924a800143012532f";

/* =========================================================
   DATABASE CONFIGURATION
   ========================================================= */

export const DATABASE_ID =
  "6a7c79d6003b3e63a916";

export const TABLE_ID =
  "resumes";

/* =========================================================
   STORAGE CONFIGURATION
   ========================================================= */

export const STORAGE_BUCKET_ID =
  "6a7928d9002ee7f7f7ea";

/* =========================================================
   APPWRITE CLIENT
   ========================================================= */

const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

/* =========================================================
   TABLES DATABASE SERVICE
   ========================================================= */

export const database = new TablesDB(client);

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const appwriteConfig = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: DATABASE_ID,
  resumeTableId: TABLE_ID,
  storageBucketId: STORAGE_BUCKET_ID,
};

export default appwriteConfig;