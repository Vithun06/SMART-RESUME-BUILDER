// src/utils/security.js

/* =========================================================
   SMART RESUME BUILDER
   SECURITY UTILITY
   ---------------------------------------------------------
   Purpose:
   - Sanitize user input
   - Prevent basic XSS payloads
   - Safely handle URLs
   - Validate IDs
   - Validate user-owned resources
   - Protect sensitive values from accidental logging
   - Provide safe storage helpers
   ========================================================= */

/* =========================================================
   CONSTANTS
   ========================================================= */

export const SECURITY_LIMITS = Object.freeze({
  MAX_TEXT_LENGTH: 10000,
  MAX_SHORT_TEXT_LENGTH: 500,
  MAX_NAME_LENGTH: 150,
  MAX_URL_LENGTH: 2048,
  MAX_ID_LENGTH: 128,
  MAX_EMAIL_LENGTH: 254,
});

/* =========================================================
   DANGEROUS HTML PATTERNS
   ========================================================= */

const DANGEROUS_HTML_PATTERN =
  /<\s*(script|iframe|object|embed|form|style|link|meta|svg|math|base)\b[^>]*>/gi;

const EVENT_HANDLER_PATTERN =
  /\bon[a-z]+\s*=/gi;

const JAVASCRIPT_PROTOCOL_PATTERN =
  /javascript\s*:/gi;

const DATA_HTML_PATTERN =
  /data\s*:\s*text\/html/gi;

/* =========================================================
   BASIC TYPE HELPERS
   ========================================================= */

export const isString = (value) => {
  return typeof value === "string";
};

export const isObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

export const isValidId = (value) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return false;
  }

  const id = value.trim();

  if (
    id.length >
    SECURITY_LIMITS.MAX_ID_LENGTH
  ) {
    return false;
  }

  return /^[a-zA-Z0-9._:-]+$/.test(id);
};

/* =========================================================
   HTML SECURITY CHECK
   ========================================================= */

export const containsDangerousHTML = (
  value
) => {
  if (!isString(value)) {
    return false;
  }

  return (
    DANGEROUS_HTML_PATTERN.test(value) ||
    EVENT_HANDLER_PATTERN.test(value) ||
    JAVASCRIPT_PROTOCOL_PATTERN.test(
      value
    ) ||
    DATA_HTML_PATTERN.test(value)
  );
};

/* =========================================================
   RESET REGEX STATE
   ========================================================= */

const resetSecurityRegexState = () => {
  DANGEROUS_HTML_PATTERN.lastIndex = 0;
  EVENT_HANDLER_PATTERN.lastIndex = 0;
  JAVASCRIPT_PROTOCOL_PATTERN.lastIndex = 0;
  DATA_HTML_PATTERN.lastIndex = 0;
};

/* =========================================================
   HTML ESCAPE
   ========================================================= */

export const escapeHTML = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* =========================================================
   SANITIZE TEXT
   ========================================================= */

export const sanitizeText = (
  value,
  maxLength =
    SECURITY_LIMITS.MAX_TEXT_LENGTH
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  let text = String(value);

  resetSecurityRegexState();

  text = text
    .replace(
      DANGEROUS_HTML_PATTERN,
      ""
    )
    .replace(
      EVENT_HANDLER_PATTERN,
      ""
    )
    .replace(
      JAVASCRIPT_PROTOCOL_PATTERN,
      ""
    )
    .replace(
      DATA_HTML_PATTERN,
      ""
    );

  text = text
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008]/g, "")
    .replace(/[\u000B-\u000C]/g, "")
    .replace(/[\u000E-\u001F]/g, "");

  return text
    .trim()
    .slice(0, maxLength);
};

/* =========================================================
   SANITIZE SHORT TEXT
   ========================================================= */

export const sanitizeShortText = (
  value
) => {
  return sanitizeText(
    value,
    SECURITY_LIMITS.MAX_SHORT_TEXT_LENGTH
  );
};

/* =========================================================
   SANITIZE NAME
   ========================================================= */

export const sanitizeName = (value) => {
  const name = sanitizeText(
    value,
    SECURITY_LIMITS.MAX_NAME_LENGTH
  );

  return name
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/* =========================================================
   SANITIZE EMAIL
   ========================================================= */

export const sanitizeEmail = (value) => {
  if (!isString(value)) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[<>"']/g, "")
    .slice(
      0,
      SECURITY_LIMITS.MAX_EMAIL_LENGTH
    );
};

/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

export const isValidEmail = (email) => {
  const sanitized =
    sanitizeEmail(email);

  if (!sanitized) {
    return false;
  }

  if (
    sanitized.length >
    SECURITY_LIMITS.MAX_EMAIL_LENGTH
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    sanitized
  );
};

/* =========================================================
   URL VALIDATION
   ---------------------------------------------------------
   Allows only:
   - https://
   - http://
   ========================================================= */

export const isSafeURL = (value) => {
  if (!isString(value)) {
    return false;
  }

  const url = value.trim();

  if (!url) {
    return false;
  }

  if (
    url.length >
    SECURITY_LIMITS.MAX_URL_LENGTH
  ) {
    return false;
  }

  try {
    const parsedURL = new URL(url);

    return (
      parsedURL.protocol === "https:" ||
      parsedURL.protocol === "http:"
    );
  } catch {
    return false;
  }
};

/* =========================================================
   SANITIZE URL
   ========================================================= */

export const sanitizeURL = (value) => {
  if (!isString(value)) {
    return "";
  }

  const url = value.trim();

  if (!isSafeURL(url)) {
    return "";
  }

  try {
    const parsedURL = new URL(url);

    return parsedURL.href.slice(
      0,
      SECURITY_LIMITS.MAX_URL_LENGTH
    );
  } catch {
    return "";
  }
};

/* =========================================================
   GITHUB URL VALIDATION
   ========================================================= */

export const isGitHubURL = (value) => {
  if (!isSafeURL(value)) {
    return false;
  }

  try {
    const hostname = new URL(value)
      .hostname
      .toLowerCase();

    return (
      hostname === "github.com" ||
      hostname === "www.github.com"
    );
  } catch {
    return false;
  }
};

/* =========================================================
   LINKEDIN URL VALIDATION
   ========================================================= */

export const isLinkedInURL = (value) => {
  if (!isSafeURL(value)) {
    return false;
  }

  try {
    const hostname = new URL(value)
      .hostname
      .toLowerCase();

    return (
      hostname === "linkedin.com" ||
      hostname === "www.linkedin.com"
    );
  } catch {
    return false;
  }
};

/* =========================================================
   RESOURCE OWNERSHIP CHECK
   ========================================================= */

export const isOwner = (
  resourceUserId,
  currentUserId
) => {
  if (
    !resourceUserId ||
    !currentUserId
  ) {
    return false;
  }

  return (
    String(resourceUserId) ===
    String(currentUserId)
  );
};

/* =========================================================
   USER ACCESS CHECK
   ========================================================= */

export const canAccessResource = ({
  resource,
  userId,
}) => {
  if (!resource || !userId) {
    return false;
  }

  const resourceOwnerId =
    resource.userId ||
    resource.user_id;

  return isOwner(
    resourceOwnerId,
    userId
  );
};

/* =========================================================
   SAFE JSON PARSE
   ========================================================= */

export const safeJSONParse = (
  value,
  fallback = null
) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/* =========================================================
   SAFE JSON STRINGIFY
   ========================================================= */

export const safeJSONStringify = (
  value,
  fallback = "{}"
) => {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

/* =========================================================
   SANITIZE OBJECT
   ---------------------------------------------------------
   Recursively sanitizes string values.
   ========================================================= */

export const sanitizeObject = (
  value,
  depth = 0
) => {
  if (depth > 10) {
    return null;
  }

  if (typeof value === "string") {
    return sanitizeText(value);
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeObject(item, depth + 1)
    );
  }

  if (isObject(value)) {
    const result = {};

    Object.entries(value).forEach(
      ([key, item]) => {
        const safeKey =
          sanitizeShortText(key);

        if (safeKey) {
          result[safeKey] =
            sanitizeObject(
              item,
              depth + 1
            );
        }
      }
    );

    return result;
  }

  return null;
};

/* =========================================================
   REMOVE SENSITIVE FIELDS
   ---------------------------------------------------------
   Prevents accidental exposure of secrets
   in logs or client-side objects.
   ========================================================= */

export const removeSensitiveFields = (
  object
) => {
  if (!isObject(object)) {
    return object;
  }

  const sensitiveKeys = new Set([
    "password",
    "passwd",
    "pass",
    "token",
    "accessToken",
    "refreshToken",
    "idToken",
    "apiKey",
    "apikey",
    "secret",
    "clientSecret",
    "privateKey",
    "authorization",
    "cookie",
    "sessionToken",
  ]);

  const result = {};

  Object.entries(object).forEach(
    ([key, value]) => {
      if (
        sensitiveKeys.has(
          key.toLowerCase()
        )
      ) {
        return;
      }

      result[key] = value;
    }
  );

  return result;
};

/* =========================================================
   SAFE ERROR MESSAGE
   ========================================================= */

export const getSafeErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  if (!error) {
    return fallback;
  }

  const message =
    typeof error === "string"
      ? error
      : error?.message;

  if (!message) {
    return fallback;
  }

  return sanitizeText(
    message,
    SECURITY_LIMITS.MAX_SHORT_TEXT_LENGTH
  );
};

/* =========================================================
   SECURE RANDOM ID
   ---------------------------------------------------------
   Uses browser crypto when available.
   ========================================================= */

export const generateSecureId = (
  prefix = "id"
) => {
  const safePrefix =
    sanitizeShortText(prefix)
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 30) || "id";

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `${safePrefix}_${crypto.randomUUID()}`;
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues ===
      "function"
  ) {
    const array =
      new Uint32Array(4);

    crypto.getRandomValues(array);

    return `${safePrefix}_${Array.from(
      array
    )
      .map((number) =>
        number.toString(36)
      )
      .join("")}`;
  }

  return `${safePrefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
};

/* =========================================================
   SAFE STORAGE CHECK
   ========================================================= */

const getStorage = (type) => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return type === "session"
      ? window.sessionStorage
      : window.localStorage;
  } catch {
    return null;
  }
};

/* =========================================================
   SAFE LOCAL STORAGE SET
   ========================================================= */

export const safeStorageSet = (
  key,
  value,
  type = "local"
) => {
  const storage =
    getStorage(type);

  if (!storage) {
    return false;
  }

  const safeKey =
    sanitizeShortText(key);

  if (!safeKey) {
    return false;
  }

  try {
    storage.setItem(
      safeKey,
      typeof value === "string"
        ? value
        : safeJSONStringify(value)
    );

    return true;
  } catch {
    return false;
  }
};

/* =========================================================
   SAFE STORAGE GET
   ========================================================= */

export const safeStorageGet = (
  key,
  type = "local"
) => {
  const storage =
    getStorage(type);

  if (!storage) {
    return null;
  }

  const safeKey =
    sanitizeShortText(key);

  if (!safeKey) {
    return null;
  }

  try {
    return storage.getItem(
      safeKey
    );
  } catch {
    return null;
  }
};

/* =========================================================
   SAFE STORAGE REMOVE
   ========================================================= */

export const safeStorageRemove = (
  key,
  type = "local"
) => {
  const storage =
    getStorage(type);

  if (!storage) {
    return false;
  }

  const safeKey =
    sanitizeShortText(key);

  if (!safeKey) {
    return false;
  }

  try {
    storage.removeItem(
      safeKey
    );

    return true;
  } catch {
    return false;
  }
};

/* =========================================================
   PASSWORD VALIDATION
   ---------------------------------------------------------
   This does NOT store or expose passwords.
   It only validates basic password requirements.
   ========================================================= */

export const validatePassword = (
  password
) => {
  if (
    typeof password !== "string"
  ) {
    return {
      valid: false,
      message:
        "Password must be a string.",
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message:
        "Password must contain at least 8 characters.",
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      message:
        "Password is too long.",
    };
  }

  return {
    valid: true,
    message: null,
  };
};

/* =========================================================
   SECURITY VALIDATION RESULT
   ========================================================= */

export const validateSecurity = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return {
      valid: true,
      sanitized: "",
      threats: [],
    };
  }

  const original =
    String(value);

  resetSecurityRegexState();

  const threats = [];

  if (
    DANGEROUS_HTML_PATTERN.test(
      original
    )
  ) {
    threats.push("dangerous-html");
  }

  resetSecurityRegexState();

  if (
    EVENT_HANDLER_PATTERN.test(
      original
    )
  ) {
    threats.push("event-handler");
  }

  resetSecurityRegexState();

  if (
    JAVASCRIPT_PROTOCOL_PATTERN.test(
      original
    )
  ) {
    threats.push("javascript-protocol");
  }

  resetSecurityRegexState();

  if (
    DATA_HTML_PATTERN.test(
      original
    )
  ) {
    threats.push("data-html");
  }

  return {
    valid: threats.length === 0,

    sanitized:
      sanitizeText(original),

    threats,
  };
};

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const security = {
  SECURITY_LIMITS,

  isString,
  isObject,
  isValidId,

  containsDangerousHTML,
  escapeHTML,
  sanitizeText,
  sanitizeShortText,
  sanitizeName,
  sanitizeEmail,

  isValidEmail,

  isSafeURL,
  sanitizeURL,
  isGitHubURL,
  isLinkedInURL,

  isOwner,
  canAccessResource,

  safeJSONParse,
  safeJSONStringify,

  sanitizeObject,
  removeSensitiveFields,
  getSafeErrorMessage,

  generateSecureId,

  safeStorageSet,
  safeStorageGet,
  safeStorageRemove,

  validatePassword,
  validateSecurity,
};

export default security;