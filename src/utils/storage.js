// src/utils/storage.js

/* =========================================================
   SMART RESUME BUILDER
   STORAGE UTILITY
   ---------------------------------------------------------
   Purpose:
   - Safe browser storage helpers
   - JSON storage helpers
   - LocalStorage / SessionStorage support
   - Storage availability checks
   - Storage cleanup helpers
   - Does NOT directly upload files to Appwrite

   IMPORTANT:
   Appwrite file upload/delete operations are handled by:
   src/services/appwriteStorage.js
   ========================================================= */

/* =========================================================
   CONSTANTS
   ========================================================= */

export const STORAGE_KEYS = Object.freeze({
  USER: "smart_resume_user",
  AUTH_USER: "smart_resume_auth_user",
  CURRENT_RESUME: "smart_resume_current_resume",
  RESUME_DRAFT: "smart_resume_draft",
  THEME: "smart_resume_theme",
  SETTINGS: "smart_resume_settings",
  PREFERENCES: "smart_resume_preferences",
});

/* =========================================================
   STORAGE TYPES
   ========================================================= */

export const STORAGE_TYPE = Object.freeze({
  LOCAL: "local",
  SESSION: "session",
});

/* =========================================================
   GET STORAGE
   ========================================================= */

const getStorage = (
  type = STORAGE_TYPE.LOCAL
) => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    if (
      type === STORAGE_TYPE.SESSION
    ) {
      return window.sessionStorage;
    }

    return window.localStorage;
  } catch (error) {
    console.error(
      "Storage access error:",
      error
    );

    return null;
  }
};

/* =========================================================
   CHECK STORAGE AVAILABILITY
   ========================================================= */

export const isStorageAvailable = (
  type = STORAGE_TYPE.LOCAL
) => {
  const storage = getStorage(type);

  if (!storage) {
    return false;
  }

  const testKey =
    "__smart_resume_storage_test__";

  try {
    storage.setItem(
      testKey,
      "1"
    );

    storage.removeItem(
      testKey
    );

    return true;
  } catch {
    return false;
  }
};

/* =========================================================
   SET ITEM
   ========================================================= */

export const setStorageItem = (
  key,
  value,
  type = STORAGE_TYPE.LOCAL
) => {
  if (!key) {
    return false;
  }

  const storage = getStorage(type);

  if (!storage) {
    return false;
  }

  try {
    const serializedValue =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

    storage.setItem(
      String(key),
      serializedValue
    );

    return true;
  } catch (error) {
    console.error(
      "Storage set error:",
      error
    );

    return false;
  }
};

/* =========================================================
   GET ITEM
   ========================================================= */

export const getStorageItem = (
  key,
  type = STORAGE_TYPE.LOCAL
) => {
  if (!key) {
    return null;
  }

  const storage = getStorage(type);

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(
      String(key)
    );
  } catch (error) {
    console.error(
      "Storage get error:",
      error
    );

    return null;
  }
};

/* =========================================================
   GET JSON ITEM
   ========================================================= */

export const getStorageJSON = (
  key,
  fallback = null,
  type = STORAGE_TYPE.LOCAL
) => {
  const value =
    getStorageItem(
      key,
      type
    );

  if (value === null) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Storage JSON parse error:",
      error
    );

    return fallback;
  }
};

/* =========================================================
   REMOVE ITEM
   ========================================================= */

export const removeStorageItem = (
  key,
  type = STORAGE_TYPE.LOCAL
) => {
  if (!key) {
    return false;
  }

  const storage = getStorage(type);

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(
      String(key)
    );

    return true;
  } catch (error) {
    console.error(
      "Storage remove error:",
      error
    );

    return false;
  }
};

/* =========================================================
   CHECK ITEM EXISTS
   ========================================================= */

export const hasStorageItem = (
  key,
  type = STORAGE_TYPE.LOCAL
) => {
  if (!key) {
    return false;
  }

  const value =
    getStorageItem(
      key,
      type
    );

  return value !== null;
};

/* =========================================================
   CLEAR ALL STORAGE
   ========================================================= */

export const clearStorage = (
  type = STORAGE_TYPE.LOCAL
) => {
  const storage = getStorage(type);

  if (!storage) {
    return false;
  }

  try {
    storage.clear();

    return true;
  } catch (error) {
    console.error(
      "Storage clear error:",
      error
    );

    return false;
  }
};

/* =========================================================
   CLEAR APPLICATION STORAGE
   ---------------------------------------------------------
   Removes only Smart Resume Builder keys.
   It does NOT clear unrelated website data.
   ========================================================= */

export const clearApplicationStorage = (
  type = STORAGE_TYPE.LOCAL
) => {
  const storage = getStorage(type);

  if (!storage) {
    return false;
  }

  try {
    Object.values(
      STORAGE_KEYS
    ).forEach((key) => {
      storage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error(
      "Application storage cleanup error:",
      error
    );

    return false;
  }
};

/* =========================================================
   SAVE JSON
   ========================================================= */

export const saveJSON = (
  key,
  data,
  type = STORAGE_TYPE.LOCAL
) => {
  if (!key) {
    return false;
  }

  try {
    return setStorageItem(
      key,
      JSON.stringify(data),
      type
    );
  } catch (error) {
    console.error(
      "Save JSON error:",
      error
    );

    return false;
  }
};

/* =========================================================
   LOAD JSON
   ========================================================= */

export const loadJSON = (
  key,
  fallback = null,
  type = STORAGE_TYPE.LOCAL
) => {
  const value =
    getStorageItem(
      key,
      type
    );

  if (value === null) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Load JSON error:",
      error
    );

    return fallback;
  }
};

/* =========================================================
   SAVE CURRENT RESUME
   ========================================================= */

export const saveCurrentResume = (
  resume
) => {
  return saveJSON(
    STORAGE_KEYS.CURRENT_RESUME,
    resume,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   LOAD CURRENT RESUME
   ========================================================= */

export const loadCurrentResume = () => {
  return loadJSON(
    STORAGE_KEYS.CURRENT_RESUME,
    null,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   REMOVE CURRENT RESUME
   ========================================================= */

export const removeCurrentResume = () => {
  return removeStorageItem(
    STORAGE_KEYS.CURRENT_RESUME,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   SAVE RESUME DRAFT
   ========================================================= */

export const saveResumeDraft = (
  resume
) => {
  return saveJSON(
    STORAGE_KEYS.RESUME_DRAFT,
    resume,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   LOAD RESUME DRAFT
   ========================================================= */

export const loadResumeDraft = () => {
  return loadJSON(
    STORAGE_KEYS.RESUME_DRAFT,
    null,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   REMOVE RESUME DRAFT
   ========================================================= */

export const removeResumeDraft = () => {
  return removeStorageItem(
    STORAGE_KEYS.RESUME_DRAFT,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   SAVE USER DATA
   ========================================================= */

export const saveUserData = (
  user
) => {
  if (!user) {
    return false;
  }

  return saveJSON(
    STORAGE_KEYS.USER,
    user,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   LOAD USER DATA
   ========================================================= */

export const loadUserData = () => {
  return loadJSON(
    STORAGE_KEYS.USER,
    null,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   REMOVE USER DATA
   ========================================================= */

export const removeUserData = () => {
  return removeStorageItem(
    STORAGE_KEYS.USER,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   SAVE THEME
   ========================================================= */

export const saveTheme = (
  theme
) => {
  if (
    theme !== "light" &&
    theme !== "dark" &&
    theme !== "system"
  ) {
    return false;
  }

  return setStorageItem(
    STORAGE_KEYS.THEME,
    theme,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   LOAD THEME
   ========================================================= */

export const loadTheme = (
  fallback = "system"
) => {
  const theme =
    getStorageItem(
      STORAGE_KEYS.THEME,
      STORAGE_TYPE.LOCAL
    );

  if (
    theme === "light" ||
    theme === "dark" ||
    theme === "system"
  ) {
    return theme;
  }

  return fallback;
};

/* =========================================================
   SAVE SETTINGS
   ========================================================= */

export const saveSettings = (
  settings
) => {
  if (!settings) {
    return false;
  }

  return saveJSON(
    STORAGE_KEYS.SETTINGS,
    settings,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   LOAD SETTINGS
   ========================================================= */

export const loadSettings = (
  fallback = {}
) => {
  return loadJSON(
    STORAGE_KEYS.SETTINGS,
    fallback,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   SAVE PREFERENCES
   ========================================================= */

export const savePreferences = (
  preferences
) => {
  if (!preferences) {
    return false;
  }

  return saveJSON(
    STORAGE_KEYS.PREFERENCES,
    preferences,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   LOAD PREFERENCES
   ========================================================= */

export const loadPreferences = (
  fallback = {}
) => {
  return loadJSON(
    STORAGE_KEYS.PREFERENCES,
    fallback,
    STORAGE_TYPE.LOCAL
  );
};

/* =========================================================
   SESSION DATA
   ========================================================= */

export const saveSessionData = (
  key,
  value
) => {
  return setStorageItem(
    key,
    value,
    STORAGE_TYPE.SESSION
  );
};

export const loadSessionData = (
  key
) => {
  return getStorageItem(
    key,
    STORAGE_TYPE.SESSION
  );
};

export const removeSessionData = (
  key
) => {
  return removeStorageItem(
    key,
    STORAGE_TYPE.SESSION
  );
};

/* =========================================================
   STORAGE SIZE ESTIMATION
   ---------------------------------------------------------
   Returns approximate character count.
   ========================================================= */

export const getStorageSize = (
  type = STORAGE_TYPE.LOCAL
) => {
  const storage = getStorage(type);

  if (!storage) {
    return 0;
  }

  let size = 0;

  try {
    for (
      let index = 0;
      index < storage.length;
      index += 1
    ) {
      const key =
        storage.key(index);

      if (!key) {
        continue;
      }

      const value =
        storage.getItem(key) || "";

      size +=
        key.length +
        value.length;
    }

    return size;
  } catch {
    return 0;
  }
};

/* =========================================================
   STORAGE QUOTA WARNING
   ---------------------------------------------------------
   Browser localStorage quota varies by browser.
   This helper only provides an approximate warning.
   ========================================================= */

export const isStorageNearLimit = (
  threshold = 4000000,
  type = STORAGE_TYPE.LOCAL
) => {
  const size =
    getStorageSize(type);

  return size >= threshold;
};

/* =========================================================
   SAFE STORAGE OPERATION
   ========================================================= */

export const withStorage = (
  callback,
  fallback = null,
  type = STORAGE_TYPE.LOCAL
) => {
  const storage = getStorage(type);

  if (!storage) {
    return fallback;
  }

  try {
    return callback(storage);
  } catch (error) {
    console.error(
      "Safe storage operation error:",
      error
    );

    return fallback;
  }
};

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const storage = {
  STORAGE_KEYS,
  STORAGE_TYPE,

  isStorageAvailable,

  setStorageItem,
  getStorageItem,
  getStorageJSON,

  removeStorageItem,
  hasStorageItem,

  clearStorage,
  clearApplicationStorage,

  saveJSON,
  loadJSON,

  saveCurrentResume,
  loadCurrentResume,
  removeCurrentResume,

  saveResumeDraft,
  loadResumeDraft,
  removeResumeDraft,

  saveUserData,
  loadUserData,
  removeUserData,

  saveTheme,
  loadTheme,

  saveSettings,
  loadSettings,

  savePreferences,
  loadPreferences,

  saveSessionData,
  loadSessionData,
  removeSessionData,

  getStorageSize,
  isStorageNearLimit,

  withStorage,
};

export default storage;