// src/services/geminiService.js

/* =========================================================
   SMART RESUME BUILDER
   GEMINI AI SERVICE
   ---------------------------------------------------------
   Purpose:
   - Central Gemini AI communication layer
   - Resume content improvement
   - ATS analysis
   - Keyword suggestions
   - Action verb suggestions
   - Skill-gap analysis
   - Interview suggestions
   - General AI text generation

   Provider:
   Google Gemini API

   SDK:
   @google/genai

   IMPORTANT:
   - API key is read from Vite environment variables.
   - Never hard-code the API key in this file.
   - Do not commit .env files to Git.
   ========================================================= */

import { GoogleGenAI } from "@google/genai";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || "";

const GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL ||
  "gemini-2.5-flash";

/* =========================================================
   CLIENT
   ---------------------------------------------------------
   The client is created only when an API key exists.
   This prevents the application from crashing during
   development/build when the key has not been configured.
   ========================================================= */

const geminiClient = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null;

/* =========================================================
   INTERNAL VALIDATION
   ========================================================= */

const validateGeminiConfiguration = () => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. " +
        "Please add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  if (!geminiClient) {
    throw new Error(
      "Gemini AI client is not initialized."
    );
  }
};

/* =========================================================
   INTERNAL TEXT NORMALIZER
   ========================================================= */

const normalizePrompt = (prompt) => {
  if (typeof prompt !== "string") {
    throw new Error(
      "Gemini prompt must be a string."
    );
  }

  const cleanedPrompt =
    prompt.trim();

  if (!cleanedPrompt) {
    throw new Error(
      "Gemini prompt cannot be empty."
    );
  }

  return cleanedPrompt;
};

/* =========================================================
   INTERNAL RESPONSE EXTRACTOR
   ========================================================= */

const extractResponseText = (
  response
) => {
  if (!response) {
    return "";
  }

  /*
   * The official Google GenAI SDK exposes
   * response.text for generated text.
   */

  if (
    typeof response.text === "string"
  ) {
    return response.text.trim();
  }

  return "";
};

/* =========================================================
   GENERATE TEXT
   ---------------------------------------------------------
   Main Gemini text-generation function.
   ========================================================= */

export const generateGeminiText =
  async ({
    prompt,
    systemInstruction = "",
    temperature = 0.7,
    maxOutputTokens = 2048,
  }) => {
    try {
      validateGeminiConfiguration();

      const cleanedPrompt =
        normalizePrompt(prompt);

      const config = {
        temperature,
        maxOutputTokens,
      };

      if (
        typeof systemInstruction ===
          "string" &&
        systemInstruction.trim()
      ) {
        config.systemInstruction =
          systemInstruction.trim();
      }

      const response =
        await geminiClient.models.generateContent(
          {
            model: GEMINI_MODEL,

            contents:
              cleanedPrompt,

            config,
          }
        );

      const text =
        extractResponseText(
          response
        );

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      return {
        success: true,
        text,
        model: GEMINI_MODEL,
        provider: "gemini",
        raw: response,
      };
    } catch (error) {
      console.error(
        "Gemini AI Error:",
        error
      );

      return {
        success: false,
        text: "",
        model: GEMINI_MODEL,
        provider: "gemini",
        error:
          error?.message ||
          "Gemini AI request failed.",
      };
    }
  };

/* =========================================================
   RESUME CONTENT IMPROVEMENT
   ========================================================= */

export const improveResumeContent =
  async ({
    content,
    section = "resume section",
  }) => {
    if (!content) {
      return {
        success: false,
        text: "",
        error:
          "Resume content is required.",
      };
    }

    const prompt = `
You are an expert professional resume writer.

Improve the following ${section} for a modern,
ATS-friendly professional resume.

Requirements:
- Keep the information truthful.
- Do not invent experience, education, skills,
  companies, certifications, or achievements.
- Use professional language.
- Make the writing concise and impactful.
- Prefer strong action verbs.
- Add measurable impact only when the
  provided information supports it.
- Do not use unnecessary buzzwords.
- Return only the improved content.

Original content:
${content}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are a professional resume optimization assistant.",
      temperature: 0.5,
      maxOutputTokens: 1200,
    });
  };

/* =========================================================
   ATS KEYWORD SUGGESTIONS
   ========================================================= */

export const generateATSKeywords =
  async ({
    resumeText,
    jobDescription = "",
  }) => {
    if (!resumeText) {
      return {
        success: false,
        text: "",
        error:
          "Resume text is required.",
      };
    }

    const prompt = `
Analyze the resume against the job description.

Identify useful ATS keywords and skills.

Rules:
- Do not invent qualifications.
- Separate existing matching skills from
  recommended missing keywords.
- Prioritize technically and professionally
  relevant terms.
- Keep the output concise.
- Return a clear structured analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription || "No job description provided."}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are an ATS resume analysis expert.",
      temperature: 0.3,
      maxOutputTokens: 1800,
    });
  };

/* =========================================================
   ACTION VERB SUGGESTIONS
   ========================================================= */

export const generateActionVerbs =
  async ({
    content,
  }) => {
    if (!content) {
      return {
        success: false,
        text: "",
        error:
          "Content is required.",
      };
    }

    const prompt = `
Analyze this resume statement and suggest
strong professional action verbs.

Requirements:
- Preserve the original meaning.
- Do not exaggerate.
- Do not invent achievements.
- Provide useful alternatives.
- Prefer ATS-friendly professional language.

Content:
${content}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are an expert in professional resume writing.",
      temperature: 0.4,
      maxOutputTokens: 800,
    });
  };

/* =========================================================
   SKILL GAP ANALYSIS
   ========================================================= */

export const generateSkillGapAnalysis =
  async ({
    resumeText,
    jobDescription,
  }) => {
    if (!resumeText) {
      return {
        success: false,
        text: "",
        error:
          "Resume text is required.",
      };
    }

    if (!jobDescription) {
      return {
        success: false,
        text: "",
        error:
          "Job description is required.",
      };
    }

    const prompt = `
Perform a practical skill-gap analysis.

Compare the candidate's resume with the
job description.

Identify:
1. Strong matching skills
2. Partially matching skills
3. Missing or weak skills
4. Recommended learning areas
5. Priority level for each gap

Rules:
- Never claim the candidate has a skill
  that is not present in the resume.
- Do not fabricate experience.
- Keep recommendations realistic.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are an AI career and skill-gap analysis assistant.",
      temperature: 0.3,
      maxOutputTokens: 2000,
    });
  };

/* =========================================================
   ACHIEVEMENT IMPROVEMENT
   ========================================================= */

export const improveAchievement =
  async ({
    achievement,
  }) => {
    if (!achievement) {
      return {
        success: false,
        text: "",
        error:
          "Achievement content is required.",
      };
    }

    const prompt = `
Rewrite this achievement for a professional
resume.

Requirements:
- Start with a strong action verb.
- Make the impact clear.
- Preserve factual accuracy.
- Do not invent numbers.
- If a measurable result is already provided,
  preserve it.
- Keep it concise.

Achievement:
${achievement}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are an expert achievement-focused resume writer.",
      temperature: 0.4,
      maxOutputTokens: 600,
    });
  };

/* =========================================================
   PROFESSIONAL SUMMARY
   ========================================================= */

export const generateProfessionalSummary =
  async ({
    resumeData,
  }) => {
    if (!resumeData) {
      return {
        success: false,
        text: "",
        error:
          "Resume data is required.",
      };
    }

    const resumeText =
      typeof resumeData === "string"
        ? resumeData
        : JSON.stringify(
            resumeData,
            null,
            2
          );

    const prompt = `
Create a concise professional resume summary
from the information below.

Requirements:
- Do not invent information.
- Use only the supplied information.
- Keep it ATS-friendly.
- Make it suitable for a fresher or early-career
  professional when applicable.
- Focus on relevant skills, education,
  projects, strengths, and career direction.
- Avoid generic clichés.
- Return only the summary.

Resume information:
${resumeText}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are a professional resume summary specialist.",
      temperature: 0.5,
      maxOutputTokens: 700,
    });
  };

/* =========================================================
   CONTEXTUAL INTERVIEW QUESTIONS
   ========================================================= */

export const generateInterviewQuestions =
  async ({
    resumeText,
    jobDescription = "",
    count = 10,
  }) => {
    if (!resumeText) {
      return {
        success: false,
        text: "",
        error:
          "Resume text is required.",
      };
    }

    const safeCount = Math.min(
      Math.max(
        Number(count) || 10,
        1
      ),
      20
    );

    const prompt = `
Generate ${safeCount} contextual interview
questions based on the candidate's resume.

If a job description is provided, also consider
the role requirements.

Include a useful mixture of:
- Technical questions
- Project questions
- Behavioral questions
- Resume-based questions
- Role-specific questions

Do not invent details that are not present.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription || "Not provided."}
`;

    return generateGeminiText({
      prompt,
      systemInstruction:
        "You are an experienced technical interviewer and career coach.",
      temperature: 0.6,
      maxOutputTokens: 2200,
    });
  };

/* =========================================================
   GENERAL RESUME AI REQUEST
   ---------------------------------------------------------
   Flexible function for future AI features.
   ========================================================= */

export const askGemini =
  async ({
    prompt,
    systemInstruction = "",
    temperature = 0.7,
    maxOutputTokens = 2048,
  }) => {
    return generateGeminiText({
      prompt,
      systemInstruction,
      temperature,
      maxOutputTokens,
    });
  };

/* =========================================================
   HEALTH / CONFIGURATION CHECK
   ---------------------------------------------------------
   This does not make an API request.
   It only checks local configuration.
   ========================================================= */

export const isGeminiConfigured =
  () => {
    return Boolean(
      GEMINI_API_KEY &&
        geminiClient
    );
  };

/* =========================================================
   GET CURRENT GEMINI CONFIG
   ---------------------------------------------------------
   API key itself is NEVER returned.
   ========================================================= */

export const getGeminiConfig =
  () => {
    return {
      provider: "gemini",
      model: GEMINI_MODEL,
      configured:
        isGeminiConfigured(),
    };
  };

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const geminiService = {
  generateGeminiText,
  improveResumeContent,
  generateATSKeywords,
  generateActionVerbs,
  generateSkillGapAnalysis,
  improveAchievement,
  generateProfessionalSummary,
  generateInterviewQuestions,
  askGemini,
  isGeminiConfigured,
  getGeminiConfig,
};

export default geminiService;