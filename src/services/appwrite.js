/* =========================================================
   SMART RESUME BUILDER
   APPWRITE SERVICE
   ---------------------------------------------------------
   Purpose:
   - Central Appwrite SDK initialization
   - Authentication
   - Tables / Database access
   - Storage access
   - Resume table configuration

   IMPORTANT:
   - No API secret is used in frontend.
   - No password is stored here.
   - Public Appwrite project configuration comes
     from appwriteConfig.js.
   ========================================================= */

import {
  Client,
  Account,
  TablesDB,
  Storage,
} from "appwrite";

import APPWRITE_CONFIG from "../config/appwriteConfig";

/* =========================================================
   APPWRITE CLIENT
   ========================================================= */

const client = new Client();

/*
 * Configure Appwrite endpoint and project.
 */

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

/* =========================================================
   APPWRITE SERVICES
   ========================================================= */

/*
 * Authentication
 *
 * Used for:
 * - Login
 * - Signup
 * - Logout
 * - Current user
 * - Session management
 */

const account = new Account(client);

/*
 * TablesDB
 *
 * Used for:
 * - Creating resume rows
 * - Reading resume rows
 * - Updating resume rows
 * - Deleting resume rows
 * - Querying user's resumes
 */

const tablesDB = new TablesDB(client);

/*
 * Storage
 *
 * Used later for:
 * - Profile photos
 * - Certificate files
 * - Resume-related uploads
 */

const storage = new Storage(client);

/* =========================================================
   DATABASE CONFIGURATION
   ========================================================= */

const databaseId = APPWRITE_CONFIG.databaseId;

const resumeTableId =
  APPWRITE_CONFIG.resumeTableId;

/* =========================================================
   EXPORT
   ========================================================= */

export {
  client,
  account,
  tablesDB,
  storage,
  databaseId,
  resumeTableId,
};

export default client;