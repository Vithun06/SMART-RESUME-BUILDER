// src/utils/apiErrorHandler.js

/* =========================================================
   SMART RESUME BUILDER
   API ERROR HANDLER
   ---------------------------------------------------------
   Purpose:
   - Centralized API error handling
   - Appwrite error handling
   - Gemini / AI API error handling
   - Network error handling
   - Firebase / legacy API error handling
   - HTTP status handling
   - User-friendly error messages
   - Developer-friendly console logging
   - Safe error normalization
   ========================================================= */

/* =========================================================
   ERROR TYPES
   ========================================================= */

export const ERROR_TYPES = Object.freeze({
  NETWORK: "NETWORK_ERROR",
  AUTH: "AUTH_ERROR",
  PERMISSION: "PERMISSION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  RATE_LIMIT: "RATE_LIMIT_ERROR",
  SERVER: "SERVER_ERROR",
  CLIENT: "CLIENT_ERROR",
  AI: "AI_ERROR",
  APPWRITE: "APPWRITE_ERROR",
  FIREBASE: "FIREBASE_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
});

/* =========================================================
   DEFAULT ERROR MESSAGES
   ========================================================= */

const DEFAULT_MESSAGES = Object.freeze({
  network:
    "Unable to connect to the server. Please check your internet connection and try again.",

  auth:
    "Your session has expired. Please sign in again.",

  permission:
    "You do not have permission to perform this action.",

  notFound:
    "The requested data could not be found.",

  validation:
    "Please check the information you entered and try again.",

  rateLimit:
    "Too many requests. Please wait a moment and try again.",

  server:
    "The server is temporarily unavailable. Please try again later.",

  ai:
    "The AI service is temporarily unavailable. Please try again later.",

  client:
    "The request could not be completed. Please try again.",

  unknown:
    "Something went wrong. Please try again.",
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
   GET ERROR CODE
   ---------------------------------------------------------
   Supports:
   - Appwrite
   - Firebase
   - Fetch/API errors
   - Gemini/AI errors
   ========================================================= */

export const getErrorCode = (error) => {
  if (!error) {
    return null;
  }

  return (
    error.code ??
    error.statusCode ??
    error.status ??
    error?.response?.status ??
    error?.error?.code ??
    null
  );
};

/* =========================================================
   GET HTTP STATUS
   ========================================================= */

export const getErrorStatus = (error) => {
  if (!error) {
    return null;
  }

  const status =
    error.status ??
    error.statusCode ??
    error?.response?.status ??
    error?.error?.status ??
    null;

  const numericStatus = Number(status);

  return Number.isFinite(numericStatus)
    ? numericStatus
    : null;
};

/* =========================================================
   GET ORIGINAL ERROR MESSAGE
   ========================================================= */

export const getOriginalErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  const possibleMessages = [
    error.message,
    error.description,
    error.details,
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.error?.message,
    error?.error?.details,
  ];

  for (const message of possibleMessages) {
    const value = safeString(message);

    if (value) {
      return value;
    }
  }

  return "";
};

/* =========================================================
   DETECT NETWORK ERROR
   ========================================================= */

export const isNetworkError = (error) => {
  if (!error) {
    return false;
  }

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  const code = safeString(error.code).toLowerCase();

  return (
    error instanceof TypeError &&
    message.includes("fetch")
  ) ||
    code === "network_error" ||
    code === "err_network" ||
    message.includes("network error") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("internet connection") ||
    message.includes("load failed");
};

/* =========================================================
   DETECT APPWRITE ERROR
   ========================================================= */

export const isAppwriteError = (error) => {
  if (!error) {
    return false;
  }

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  const type =
    safeString(error.type).toLowerCase();

  const code =
    safeString(error.code).toLowerCase();

  return (
    type.includes("appwrite") ||
    code.includes("appwrite") ||
    message.includes("appwrite") ||
    Boolean(
      error?.responseHeaders &&
        (error?.statusCode || error?.type)
    )
  );
};

/* =========================================================
   DETECT FIREBASE ERROR
   ========================================================= */

export const isFirebaseError = (error) => {
  if (!error) {
    return false;
  }

  const code = safeString(error.code).toLowerCase();

  return (
    code.startsWith("auth/") ||
    code.startsWith("firebase/") ||
    code.startsWith("firestore/")
  );
};

/* =========================================================
   DETECT AI ERROR
   ========================================================= */

export const isAIError = (error) => {
  if (!error) {
    return false;
  }

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  const code =
    safeString(
      error.code ??
        error?.error?.code ??
        error?.response?.data?.code
    ).toLowerCase();

  const name =
    safeString(error.name).toLowerCase();

  return (
    code.includes("gemini") ||
    code.includes("ai") ||
    name.includes("gemini") ||
    name.includes("generative") ||
    message.includes("gemini") ||
    message.includes("generative ai") ||
    message.includes("model") ||
    message.includes("generation") ||
    message.includes("safety filter") ||
    message.includes("safety settings")
  );
};

/* =========================================================
   DETECT AUTH ERROR
   ========================================================= */

export const isAuthError = (error) => {
  if (!error) {
    return false;
  }

  const status = getErrorStatus(error);

  const code =
    safeString(error.code).toLowerCase();

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  return (
    status === 401 ||
    code.includes("unauthorized") ||
    code.includes("unauthenticated") ||
    code.includes("user_invalid") ||
    code.includes("user_session") ||
    code.includes("invalid_credentials") ||
    message.includes("unauthorized") ||
    message.includes("authentication") ||
    message.includes("session expired")
  );
};

/* =========================================================
   DETECT PERMISSION ERROR
   ========================================================= */

export const isPermissionError = (error) => {
  if (!error) {
    return false;
  }

  const status = getErrorStatus(error);

  const code =
    safeString(error.code).toLowerCase();

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  return (
    status === 403 ||
    code.includes("permission") ||
    code.includes("forbidden") ||
    message.includes("permission denied") ||
    message.includes("forbidden")
  );
};

/* =========================================================
   DETECT NOT FOUND ERROR
   ========================================================= */

export const isNotFoundError = (error) => {
  if (!error) {
    return false;
  }

  const status = getErrorStatus(error);

  const code =
    safeString(error.code).toLowerCase();

  return (
    status === 404 ||
    code.includes("not_found") ||
    code.includes("not-found")
  );
};

/* =========================================================
   DETECT VALIDATION ERROR
   ========================================================= */

export const isValidationError = (error) => {
  if (!error) {
    return false;
  }

  const status = getErrorStatus(error);

  const code =
    safeString(error.code).toLowerCase();

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  return (
    status === 400 ||
    status === 422 ||
    code.includes("validation") ||
    code.includes("invalid") ||
    message.includes("validation") ||
    message.includes("invalid input")
  );
};

/* =========================================================
   DETECT RATE LIMIT ERROR
   ========================================================= */

export const isRateLimitError = (error) => {
  if (!error) {
    return false;
  }

  const status = getErrorStatus(error);

  const code =
    safeString(error.code).toLowerCase();

  const message =
    getOriginalErrorMessage(error).toLowerCase();

  return (
    status === 429 ||
    code.includes("rate_limit") ||
    code.includes("too_many_requests") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
};

/* =========================================================
   CLASSIFY ERROR
   ========================================================= */

export const classifyError = (error) => {
  if (!error) {
    return ERROR_TYPES.UNKNOWN;
  }

  if (isRateLimitError(error)) {
    return ERROR_TYPES.RATE_LIMIT;
  }

  if (isAuthError(error)) {
    return ERROR_TYPES.AUTH;
  }

  if (isPermissionError(error)) {
    return ERROR_TYPES.PERMISSION;
  }

  if (isNotFoundError(error)) {
    return ERROR_TYPES.NOT_FOUND;
  }

  if (isValidationError(error)) {
    return ERROR_TYPES.VALIDATION;
  }

  if (isNetworkError(error)) {
    return ERROR_TYPES.NETWORK;
  }

  if (isAIError(error)) {
    return ERROR_TYPES.AI;
  }

  if (isAppwriteError(error)) {
    return ERROR_TYPES.APPWRITE;
  }

  if (isFirebaseError(error)) {
    return ERROR_TYPES.FIREBASE;
  }

  const status = getErrorStatus(error);

  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }

  if (status >= 400) {
    return ERROR_TYPES.CLIENT;
  }

  return ERROR_TYPES.UNKNOWN;
};

/* =========================================================
   USER-FRIENDLY MESSAGE
   ========================================================= */

export const getUserFriendlyMessage = (
  error,
  fallbackMessage
) => {
  const type = classifyError(error);

  switch (type) {
    case ERROR_TYPES.NETWORK:
      return DEFAULT_MESSAGES.network;

    case ERROR_TYPES.AUTH:
      return DEFAULT_MESSAGES.auth;

    case ERROR_TYPES.PERMISSION:
      return DEFAULT_MESSAGES.permission;

    case ERROR_TYPES.NOT_FOUND:
      return DEFAULT_MESSAGES.notFound;

    case ERROR_TYPES.VALIDATION:
      return DEFAULT_MESSAGES.validation;

    case ERROR_TYPES.RATE_LIMIT:
      return DEFAULT_MESSAGES.rateLimit;

    case ERROR_TYPES.AI:
      return DEFAULT_MESSAGES.ai;

    case ERROR_TYPES.SERVER:
      return DEFAULT_MESSAGES.server;

    case ERROR_TYPES.APPWRITE:
    case ERROR_TYPES.FIREBASE:
    case ERROR_TYPES.CLIENT:
    case ERROR_TYPES.UNKNOWN:
    default:
      return (
        safeString(fallbackMessage) ||
        DEFAULT_MESSAGES.unknown
      );
  }
};

/* =========================================================
   NORMALIZE ERROR
   ---------------------------------------------------------
   Converts any error into a predictable object.
   ========================================================= */

export const normalizeApiError = (
  error,
  fallbackMessage
) => {
  const type = classifyError(error);
  const status = getErrorStatus(error);
  const code = getErrorCode(error);
  const originalMessage =
    getOriginalErrorMessage(error);

  return {
    success: false,

    type,

    code: code ?? null,

    status: status ?? null,

    message: getUserFriendlyMessage(
      error,
      fallbackMessage
    ),

    originalMessage:
      originalMessage || null,

    retryable:
      type === ERROR_TYPES.NETWORK ||
      type === ERROR_TYPES.RATE_LIMIT ||
      type === ERROR_TYPES.SERVER ||
      type === ERROR_TYPES.AI,

    requiresAuthentication:
      type === ERROR_TYPES.AUTH,

    requiresPermission:
      type === ERROR_TYPES.PERMISSION,

    timestamp:
      new Date().toISOString(),
  };
};

/* =========================================================
   HANDLE API ERROR
   ---------------------------------------------------------
   Main function to use inside services.
   ========================================================= */

export const handleApiError = (
  error,
  options = {}
) => {
  const {
    fallbackMessage,
    log = true,
    context = "API Request",
  } = options;

  const normalizedError =
    normalizeApiError(
      error,
      fallbackMessage
    );

  if (log) {
    console.error(
      `[${context}]`,
      {
        type: normalizedError.type,
        code: normalizedError.code,
        status: normalizedError.status,
        message:
          normalizedError.originalMessage ||
          normalizedError.message,
      },
      error
    );
  }

  return normalizedError;
};

/* =========================================================
   ASYNC ERROR WRAPPER
   ---------------------------------------------------------
   Useful for service functions.
   ========================================================= */

export const withApiErrorHandling = async (
  asyncFunction,
  options = {}
) => {
  try {
    const result = await asyncFunction();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleApiError(
      error,
      options
    );
  }
};

/* =========================================================
   RETRY HELPER
   ---------------------------------------------------------
   Retries only retryable errors.
   ========================================================= */

export const retryApiRequest = async (
  asyncFunction,
  options = {}
) => {
  const {
    retries = 2,
    delay = 1000,
    context = "API Retry",
  } = options;

  let lastError = null;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt += 1
  ) {
    try {
      const result =
        await asyncFunction();

      return {
        success: true,
        data: result,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error;

      const normalized =
        normalizeApiError(error);

      if (
        !normalized.retryable ||
        attempt === retries
      ) {
        break;
      }

      const waitTime =
        delay * Math.pow(2, attempt);

      await new Promise((resolve) => {
        setTimeout(resolve, waitTime);
      });
    }
  }

  return {
    ...handleApiError(lastError, {
      context,
    }),

    attempts: retries + 1,
  };
};

/* =========================================================
   HTTP STATUS MESSAGE
   ========================================================= */

export const getHttpStatusMessage = (
  status
) => {
  const numericStatus = Number(status);

  switch (numericStatus) {
    case 400:
      return "Bad request.";

    case 401:
      return "Authentication required.";

    case 403:
      return "Permission denied.";

    case 404:
      return "Requested resource not found.";

    case 408:
      return "Request timed out.";

    case 409:
      return "The request conflicts with existing data.";

    case 422:
      return "The submitted data is invalid.";

    case 429:
      return "Too many requests. Please try again later.";

    case 500:
      return "Internal server error.";

    case 502:
      return "Bad gateway.";

    case 503:
      return "Service temporarily unavailable.";

    case 504:
      return "Gateway timeout.";

    default:
      return "An unexpected server error occurred.";
  }
};

/* =========================================================
   EXPORT DEFAULT
   ========================================================= */

const apiErrorHandler = {
  ERROR_TYPES,

  getErrorCode,
  getErrorStatus,
  getOriginalErrorMessage,

  isNetworkError,
  isAppwriteError,
  isFirebaseError,
  isAIError,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isValidationError,
  isRateLimitError,

  classifyError,

  getUserFriendlyMessage,
  normalizeApiError,
  handleApiError,

  withApiErrorHandling,
  retryApiRequest,

  getHttpStatusMessage,
};

export default apiErrorHandler;