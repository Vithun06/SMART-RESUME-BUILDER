// src/services/appwriteAuth.js

import { account } from "./appwriteConfig";

/* =========================================================
   SMART RESUME BUILDER
   APPWRITE AUTHENTICATION SERVICE
   ---------------------------------------------------------
   Handles:
   - User Signup
   - User Login
   - User Logout
   - Current User
   - Session Check
   - Authentication Status
   - Auth Error Handling
   ========================================================= */


/* =========================================================
   CREATE ACCOUNT
   ---------------------------------------------------------
   Creates a new Appwrite account using:
   - Email
   - Password
   - Name
   ========================================================= */

export const createAccount = async ({
  name,
  email,
  password,
}) => {
  try {
    const cleanName = String(
      name || ""
    ).trim();

    const cleanEmail = String(
      email || ""
    )
      .trim()
      .toLowerCase();

    const cleanPassword = String(
      password || ""
    );

    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    if (!cleanName) {
      return {
        success: false,
        error: "Please enter your name.",
      };
    }

    if (!cleanEmail) {
      return {
        success: false,
        error: "Please enter your email.",
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        error: "Please enter your password.",
      };
    }

    if (cleanPassword.length < 8) {
      return {
        success: false,
        error:
          "Password must contain at least 8 characters.",
      };
    }

    /* -------------------------------------------------------
       CREATE APPWRITE ACCOUNT
       ------------------------------------------------------- */

    const user = await account.create(
      "unique()",
      cleanEmail,
      cleanPassword,
      cleanName
    );

    return {
      success: true,

      data: {
        id: user.$id,
        name: user.name,
        email: user.email,
        emailVerification:
          user.emailVerification,
      },

      message:
        "Account created successfully.",
    };
  } catch (error) {
    console.error(
      "Appwrite Signup Error:",
      error
    );

    return {
      success: false,
      error:
        getAuthErrorMessage(error),
    };
  }
};


/* =========================================================
   LOGIN
   ---------------------------------------------------------
   Creates an email/password session.
   ========================================================= */

export const loginUser = async ({
  email,
  password,
}) => {
  try {
    const cleanEmail = String(
      email || ""
    )
      .trim()
      .toLowerCase();

    const cleanPassword = String(
      password || ""
    );

    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    if (!cleanEmail) {
      return {
        success: false,
        error: "Please enter your email.",
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        error: "Please enter your password.",
      };
    }

    /* -------------------------------------------------------
       CREATE EMAIL SESSION
       ------------------------------------------------------- */

    const session =
      await account.createEmailPasswordSession(
        cleanEmail,
        cleanPassword
      );

    /* -------------------------------------------------------
       GET CURRENT USER
       ------------------------------------------------------- */

    const user =
      await account.get();

    return {
      success: true,

      data: {
        sessionId:
          session.$id,

        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          emailVerification:
            user.emailVerification,
        },
      },

      message:
        "Login successful.",
    };
  } catch (error) {
    console.error(
      "Appwrite Login Error:",
      error
    );

    return {
      success: false,
      error:
        getAuthErrorMessage(error),
    };
  }
};


/* =========================================================
   LOGOUT
   ---------------------------------------------------------
   Deletes the current session.
   ========================================================= */

export const logoutUser = async () => {
  try {
    await account.deleteSession(
      "current"
    );

    return {
      success: true,
      message:
        "Logged out successfully.",
    };
  } catch (error) {
    console.error(
      "Appwrite Logout Error:",
      error
    );

    return {
      success: false,
      error:
        getAuthErrorMessage(error),
    };
  }
};


/* =========================================================
   GET CURRENT USER
   ---------------------------------------------------------
   Returns the currently authenticated Appwrite user.

   If there is no active session, returns:
   success: false
   user: null
   ========================================================= */

export const getCurrentUser = async () => {
  try {
    const user =
      await account.get();

    return {
      success: true,

      data: {
        id: user.$id,
        name: user.name,
        email: user.email,

        emailVerification:
          user.emailVerification,

        status:
          user.status,

        registration:
          user.registration,

        lastActive:
          user.lastActive,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        getAuthErrorMessage(error),
    };
  }
};


/* =========================================================
   CHECK AUTHENTICATION
   ---------------------------------------------------------
   Simple helper to determine whether the user is logged in.
   ========================================================= */

export const isAuthenticated =
  async () => {
    try {
      await account.get();

      return true;
    } catch {
      return false;
    }
  };


/* =========================================================
   GET CURRENT USER ID
   --------------------------------------------------------- */

export const getCurrentUserId =
  async () => {
    try {
      const user =
        await account.get();

      return user.$id;
    } catch {
      return null;
    }
  };


/* =========================================================
   GET CURRENT USER EMAIL
   --------------------------------------------------------- */

export const getCurrentUserEmail =
  async () => {
    try {
      const user =
        await account.get();

      return user.email;
    } catch {
      return null;
    }
  };


/* =========================================================
   GET CURRENT USER NAME
   --------------------------------------------------------- */

export const getCurrentUserName =
  async () => {
    try {
      const user =
        await account.get();

      return user.name;
    } catch {
      return null;
    }
  };


/* =========================================================
   UPDATE USER NAME
   --------------------------------------------------------- */

export const updateUserName =
  async (name) => {
    try {
      const cleanName = String(
        name || ""
      ).trim();

      if (!cleanName) {
        return {
          success: false,
          error:
            "Please enter a valid name.",
        };
      }

      const user =
        await account.updateName(
          cleanName
        );

      return {
        success: true,

        data: {
          id: user.$id,
          name: user.name,
          email: user.email,
        },

        message:
          "Name updated successfully.",
      };
    } catch (error) {
      console.error(
        "Update Name Error:",
        error
      );

      return {
        success: false,
        error:
          getAuthErrorMessage(error),
      };
    }
  };


/* =========================================================
   SEND PASSWORD RESET EMAIL
   ---------------------------------------------------------
   User can request a password reset link.
   ========================================================= */

export const sendPasswordReset =
  async (email) => {
    try {
      const cleanEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      if (!cleanEmail) {
        return {
          success: false,
          error:
            "Please enter your email.",
        };
      }

      /*
       * IMPORTANT:
       *
       * Replace this URL later with your actual
       * password reset route.
       *
       * Example:
       * https://your-domain.com/reset-password
       */

      const resetUrl =
        `${window.location.origin}/reset-password`;

      await account.createRecovery(
        cleanEmail,
        resetUrl
      );

      return {
        success: true,
        message:
          "Password reset link has been sent to your email.",
      };
    } catch (error) {
      console.error(
        "Password Reset Error:",
        error
      );

      return {
        success: false,
        error:
          getAuthErrorMessage(error),
      };
    }
  };


/* =========================================================
   COMPLETE PASSWORD RESET
   ---------------------------------------------------------
   Used by the reset-password page.
   ========================================================= */

export const completePasswordReset =
  async ({
    userId,
    secret,
    password,
  }) => {
    try {
      if (!userId) {
        return {
          success: false,
          error:
            "Password reset user ID is missing.",
        };
      }

      if (!secret) {
        return {
          success: false,
          error:
            "Password reset secret is missing.",
        };
      }

      if (!password) {
        return {
          success: false,
          error:
            "Please enter a new password.",
        };
      }

      if (password.length < 8) {
        return {
          success: false,
          error:
            "Password must contain at least 8 characters.",
        };
      }

      await account.updateRecovery(
        userId,
        secret,
        password
      );

      return {
        success: true,
        message:
          "Password updated successfully.",
      };
    } catch (error) {
      console.error(
        "Complete Password Reset Error:",
        error
      );

      return {
        success: false,
        error:
          getAuthErrorMessage(error),
      };
    }
  };


/* =========================================================
   SEND EMAIL VERIFICATION
   ========================================================= */

export const sendEmailVerification =
  async () => {
    try {
      const verificationUrl =
        `${window.location.origin}/verify-email`;

      await account.createVerification(
        verificationUrl
      );

      return {
        success: true,
        message:
          "Verification email sent successfully.",
      };
    } catch (error) {
      console.error(
        "Email Verification Error:",
        error
      );

      return {
        success: false,
        error:
          getAuthErrorMessage(error),
      };
    }
  };


/* =========================================================
   COMPLETE EMAIL VERIFICATION
   ========================================================= */

export const completeEmailVerification =
  async ({
    userId,
    secret,
  }) => {
    try {
      if (!userId || !secret) {
        return {
          success: false,
          error:
            "Invalid email verification link.",
        };
      }

      await account.updateVerification(
        userId,
        secret
      );

      return {
        success: true,
        message:
          "Email verified successfully.",
      };
    } catch (error) {
      console.error(
        "Complete Email Verification Error:",
        error
      );

      return {
        success: false,
        error:
          getAuthErrorMessage(error),
      };
    }
  };


/* =========================================================
   AUTH ERROR HANDLER
   ---------------------------------------------------------
   Converts Appwrite technical errors into
   user-friendly messages.
   ========================================================= */

const getAuthErrorMessage = (
  error
) => {
  const message =
    String(
      error?.message || ""
    ).toLowerCase();

  const code =
    error?.code;


  /* -------------------------------------------------------
     INVALID CREDENTIALS
     ------------------------------------------------------- */

  if (
    code === 401 ||
    message.includes(
      "invalid credentials"
    ) ||
    message.includes(
      "invalid password"
    ) ||
    message.includes(
      "user not found"
    )
  ) {
    return "Incorrect email or password.";
  }


  /* -------------------------------------------------------
     USER ALREADY EXISTS
     ------------------------------------------------------- */

  if (
    code === 409 ||
    message.includes(
      "already exists"
    ) ||
    message.includes(
      "user with the same id"
    ) ||
    message.includes(
      "email already"
    )
  ) {
    return "An account with this email already exists.";
  }


  /* -------------------------------------------------------
     INVALID EMAIL
     ------------------------------------------------------- */

  if (
    message.includes(
      "invalid email"
    ) ||
    message.includes(
      "email is invalid"
    )
  ) {
    return "Please enter a valid email address.";
  }


  /* -------------------------------------------------------
     PASSWORD TOO WEAK
     ------------------------------------------------------- */

  if (
    message.includes(
      "password must"
    ) ||
    message.includes(
      "password should"
    )
  ) {
    return "Password does not meet the required security rules.";
  }


  /* -------------------------------------------------------
     RATE LIMIT
     ------------------------------------------------------- */

  if (
    code === 429 ||
    message.includes(
      "rate limit"
    )
  ) {
    return "Too many requests. Please try again later.";
  }


  /* -------------------------------------------------------
     NETWORK ERROR
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
    "Authentication failed. Please try again."
  );
};


/* =========================================================
   DEFAULT AUTH SERVICE
   ========================================================= */

const appwriteAuth = {
  createAccount,
  loginUser,
  logoutUser,

  getCurrentUser,
  isAuthenticated,

  getCurrentUserId,
  getCurrentUserEmail,
  getCurrentUserName,

  updateUserName,

  sendPasswordReset,
  completePasswordReset,

  sendEmailVerification,
  completeEmailVerification,
};

export default appwriteAuth;