// src/services/aiService.js

/* =========================================================
   SMART RESUME BUILDER
   CENTRAL AI SERVICE
   ---------------------------------------------------------
   Provider:
   - Google Gemini

   Purpose:
   - Centralized AI communication
   - Resume improvement
   - Resume analysis
   - ATS keyword suggestions
   - Skill-gap analysis
   - Action verb suggestions
   - Achievement improvement
   - Interview suggestions
   - Human vs AI writing analysis
   - Contextual career suggestions

   IMPORTANT:
   - React components should NOT call Gemini directly.
   - All AI requests should pass through this service.
   - API keys must never be hard-coded.
   - AI suggestions must NOT silently overwrite user data.

   Package:
   @google/genai
   ========================================================= */

import { GoogleGenAI } from "@google/genai";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || "";

const DEFAULT_MODEL =
  import.meta.env.VITE_GEMINI_MODEL ||
  "gemini-2.5-flash";

const MAX_INPUT_LENGTH = 30000;
const MAX_OUTPUT_TOKENS = 2048;

/* =========================================================
   AI CLIENT
   ========================================================= */

let aiClient = null;

/**
 * Creates the Gemini client only when required.
 */
const getAIClient = () => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. " +
        "Please add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
  }

  return aiClient;
};

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

/**
 * Safely converts any value into text.
 */
const toSafeText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Limits very large input before sending it to the model.
 */
const limitText = (
  value,
  maxLength = MAX_INPUT_LENGTH
) => {
  const text = toSafeText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
};

/**
 * Cleans AI-generated text.
 */
const cleanText = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .trim();
};

/**
 * Removes Markdown code fences from JSON responses.
 */
const removeCodeFences = (value) => {
  return String(value || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

/**
 * Attempts to parse JSON returned by the model.
 */
const parseJSON = (value, fallback = null) => {
  try {
    const cleaned = removeCodeFences(value);

    return JSON.parse(cleaned);
  } catch (error) {
    console.warn(
      "AI JSON parsing failed:",
      error
    );

    return fallback;
  }
};

/**
 * Creates a consistent service response.
 */
const successResponse = (data) => ({
  success: true,
  data,
  error: null,
});

/**
 * Creates a consistent error response.
 */
const errorResponse = (
  error,
  fallbackMessage = "AI request failed."
) => {
  console.error(
    "Smart Resume Builder AI Error:",
    error
  );

  return {
    success: false,
    data: null,
    error:
      error?.message ||
      fallbackMessage,
  };
};

/* =========================================================
   CORE GEMINI REQUEST
   ========================================================= */

/**
 * Central Gemini text-generation function.
 *
 * All higher-level AI features use this function.
 */
export const generateAIText = async ({
  prompt,
  systemInstruction = "",
  temperature = 0.4,
  maxOutputTokens = MAX_OUTPUT_TOKENS,
} = {}) => {
  try {
    const safePrompt = limitText(prompt);

    if (!safePrompt) {
      return errorResponse(
        new Error("AI prompt is required."),
        "AI prompt is required."
      );
    }

    const client = getAIClient();

    const response =
      await client.models.generateContent({
        model: DEFAULT_MODEL,

        contents: safePrompt,

        config: {
          temperature,

          maxOutputTokens,

          ...(systemInstruction
            ? {
                systemInstruction:
                  limitText(
                    systemInstruction,
                    10000
                  ),
              }
            : {}),
        },
      });

    const text = cleanText(
      response?.text
    );

    if (!text) {
      return errorResponse(
        new Error(
          "Gemini returned an empty response."
        ),
        "AI returned an empty response."
      );
    }

    return successResponse(text);
  } catch (error) {
    return errorResponse(
      error,
      "Unable to generate AI response."
    );
  }
};

/* =========================================================
   JSON AI REQUEST
   ========================================================= */

/**
 * Generates structured JSON from Gemini.
 */
export const generateAIJSON = async ({
  prompt,
  systemInstruction = "",
  temperature = 0.2,
} = {}) => {
  try {
    const safePrompt = limitText(prompt);

    if (!safePrompt) {
      return errorResponse(
        new Error("AI prompt is required."),
        "AI prompt is required."
      );
    }

    const client = getAIClient();

    const response =
      await client.models.generateContent({
        model: DEFAULT_MODEL,

        contents: safePrompt,

        config: {
          temperature,

          maxOutputTokens:
            MAX_OUTPUT_TOKENS,

          responseMimeType:
            "application/json",

          ...(systemInstruction
            ? {
                systemInstruction:
                  limitText(
                    systemInstruction,
                    10000
                  ),
              }
            : {}),
        },
      });

    const parsed = parseJSON(
      response?.text,
      null
    );

    if (parsed === null) {
      return errorResponse(
        new Error(
          "AI returned invalid JSON."
        ),
        "AI returned invalid structured data."
      );
    }

    return successResponse(parsed);
  } catch (error) {
    return errorResponse(
      error,
      "Unable to generate AI structured response."
    );
  }
};

/* =========================================================
   RESUME CONTEXT
   ========================================================= */

/**
 * Converts resume data into a safe AI-readable format.
 */
const buildResumeContext = (
  resumeData
) => {
  if (!resumeData) {
    return "No resume data was provided.";
  }

  if (typeof resumeData === "string") {
    return limitText(resumeData);
  }

  try {
    return limitText(
      JSON.stringify(
        resumeData,
        null,
        2
      )
    );
  } catch {
    return limitText(
      String(resumeData)
    );
  }
};

/* =========================================================
   RESUME IMPROVEMENT
   ========================================================= */

/**
 * Improves a resume without changing its meaning.
 */
export const improveResume = async (
  resumeData,
  options = {}
) => {
  const {
    targetRole = "",
    experienceLevel = "",
    industry = "",
  } = options;

  const prompt = `
You are an expert resume improvement assistant.

Improve the following resume while preserving
the candidate's factual information.

Rules:
1. Do not invent companies.
2. Do not invent degrees.
3. Do not invent certifications.
4. Do not invent job titles.
5. Do not invent achievements.
6. Do not change dates.
7. Improve clarity and professionalism.
8. Use strong action verbs.
9. Make content ATS-friendly.
10. Keep the writing natural and human.
11. Do not silently remove important information.

Target role:
${limitText(targetRole, 2000) || "Not specified"}

Experience level:
${limitText(experienceLevel, 1000) || "Not specified"}

Industry:
${limitText(industry, 1000) || "Not specified"}

Resume:
${buildResumeContext(resumeData)}

Return the improved resume as clear structured text.
`;

  return generateAIText({
    prompt,
    systemInstruction:
      "You are a professional resume editor. " +
      "Never fabricate candidate information.",
    temperature: 0.35,
  });
};

/* =========================================================
   SENTENCE IMPROVEMENT
   ========================================================= */

/**
 * Improves one resume sentence.
 */
export const improveSentence = async (
  sentence,
  options = {}
) => {
  const {
    role = "",
    tone = "professional",
  } = options;

  const text = limitText(
    sentence,
    5000
  );

  if (!text) {
    return errorResponse(
      new Error(
        "Sentence is required."
      ),
      "Sentence is required."
    );
  }

  const prompt = `
Improve this resume sentence.

Role:
${limitText(role, 1000) || "Not specified"}

Preferred tone:
${limitText(tone, 500)}

Original sentence:
${text}

Requirements:
- Preserve the original meaning.
- Do not invent facts.
- Use a strong action verb where appropriate.
- Make it concise.
- Make it professional.
- Make it ATS-friendly.

Return only the improved sentence.
`;

  return generateAIText({
    prompt,
    systemInstruction:
      "You improve resume wording without fabricating facts.",
    temperature: 0.3,
    maxOutputTokens: 500,
  });
};

/* =========================================================
   ACHIEVEMENT IMPROVEMENT
   ========================================================= */

/**
 * Converts a basic achievement statement
 * into a stronger resume achievement.
 */
export const improveAchievement = async (
  achievement,
  options = {}
) => {
  const {
    role = "",
    industry = "",
  } = options;

  const prompt = `
Improve the following resume achievement.

Role:
${limitText(role, 1000) || "Not specified"}

Industry:
${limitText(industry, 1000) || "Not specified"}

Achievement:
${limitText(achievement, 5000)}

Rules:
- Never invent numbers.
- Never invent percentages.
- Never invent business results.
- Never invent responsibilities.
- Preserve factual meaning.
- Use an appropriate action verb.
- Make the statement concise.
- Highlight impact only when supported by the original information.

Return only the improved achievement.
`;

  return generateAIText({
    prompt,
    systemInstruction:
      "You are a factual resume achievement editor.",
    temperature: 0.3,
    maxOutputTokens: 600,
  });
};

/* =========================================================
   ACTION VERBS
   ========================================================= */

/**
 * Suggests stronger action verbs.
 */
export const suggestActionVerbs = async (
  sentence,
  role = ""
) => {
  const prompt = `
Suggest strong resume action verbs for this sentence.

Role:
${limitText(role, 1000) || "Not specified"}

Sentence:
${limitText(sentence, 5000)}

Return JSON in exactly this format:

{
  "verbs": [
    "verb1",
    "verb2",
    "verb3",
    "verb4",
    "verb5"
  ]
}

Only return verbs that naturally fit the sentence.
`;

  return generateAIJSON({
    prompt,
    systemInstruction:
      "Return valid JSON only.",
    temperature: 0.2,
  });
};

/* =========================================================
   INDUSTRY KEYWORDS
   ========================================================= */

/**
 * Suggests industry and role-specific keywords.
 */
export const suggestIndustryKeywords = async (
  resumeData,
  targetRole = "",
  industry = ""
) => {
  const prompt = `
Analyze this resume for ATS-relevant keywords.

Target role:
${limitText(targetRole, 1500) || "Not specified"}

Industry:
${limitText(industry, 1500) || "Not specified"}

Resume:
${buildResumeContext(resumeData)}

Return JSON:

{
  "recommendedKeywords": [],
  "existingKeywords": [],
  "missingKeywords": [],
  "priorityKeywords": []
}

Important:
- Do not claim a keyword is mandatory unless justified.
- Recommend relevant keywords only.
- Do not invent candidate skills.
`;

  return generateAIJSON({
    prompt,
    systemInstruction:
      "You are an ATS keyword analysis assistant. " +
      "Return valid JSON only.",
    temperature: 0.2,
  });
};

/* =========================================================
   SKILL GAP ANALYSIS
   ========================================================= */

/**
 * Finds potential skill gaps for a target role.
 */
export const analyzeSkillGap = async (
  resumeData,
  targetRole,
  jobDescription = ""
) => {
  const prompt = `
Perform a skill-gap analysis.

Target role:
${limitText(targetRole, 2000)}

Job description:
${limitText(jobDescription, 10000) || "Not provided"}

Resume:
${buildResumeContext(resumeData)}

Return JSON:

{
  "matchedSkills": [],
  "missingSkills": [],
  "recommendedSkills": [],
  "priority": [
    {
      "skill": "",
      "reason": "",
      "importance": "high"
    }
  ],
  "learningSuggestions": []
}

Rules:
- Do not claim the candidate has a skill unless it appears in the resume.
- Missing skills are recommendations, not facts.
- Keep recommendations practical.
`;

  return generateAIJSON({
    prompt,
    systemInstruction:
      "You are a career skill-gap analysis assistant. " +
      "Return valid JSON only.",
    temperature: 0.25,
  });
};

/* =========================================================
   RESUME QUALITY ANALYSIS
   ========================================================= */

/**
 * Performs an overall AI quality analysis.
 */
export const analyzeResumeQuality = async (
  resumeData,
  targetRole = ""
) => {
  const prompt = `
Analyze the quality of this resume.

Target role:
${limitText(targetRole, 1500) || "Not specified"}

Resume:
${buildResumeContext(resumeData)}

Evaluate:
- clarity
- structure
- relevance
- action verbs
- achievements
- ATS readiness
- keyword usage
- readability
- professionalism
- consistency

Return JSON:

{
  "overallScore": 0,
  "sectionScores": {
    "clarity": 0,
    "structure": 0,
    "relevance": 0,
    "achievements": 0,
    "atsReadiness": 0,
    "readability": 0
  },
  "strengths": [],
  "weaknesses": [],
  "improvements": []
}

Use scores from 0 to 100.
`;

  return generateAIJSON({
    prompt,
    systemInstruction:
      "You are a professional resume reviewer. " +
      "Return valid JSON only.",
    temperature: 0.2,
  });
};

/* =========================================================
   HUMAN VS AI WRITING ANALYSIS
   ========================================================= */

/**
 * Compares whether resume language feels natural/human
 * versus overly AI-generated.
 *
 * This is an editorial signal, NOT a definitive AI detector.
 */
export const analyzeHumanVsAIStyle = async (
  resumeData
) => {
  const prompt = `
Analyze the writing style of this resume.

Resume:
${buildResumeContext(resumeData)}

Evaluate whether the writing feels:
- natural
- specific
- authentic
- generic
- repetitive
- overly polished
- formulaic

Return JSON:

{
  "humanStyleScore": 0,
  "aiStyleScore": 0,
  "naturalness": 0,
  "specificity": 0,
  "repetition": 0,
  "genericLanguage": 0,
  "explanation": "",
  "suggestions": []
}

Important:
This is a writing-style analysis.
Do NOT claim that AI authorship can be proven with certainty.

Scores must be from 0 to 100.
`;

  return generateAIJSON({
    prompt,
    systemInstruction:
      "You are a resume writing-style evaluator. " +
      "Do not make definitive claims about AI authorship.",
    temperature: 0.2,
  });
};

/* =========================================================
   CONTEXTUAL INTERVIEW QUESTIONS
   ========================================================= */

/**
 * Generates interview questions based on resume content.
 */
export const generateInterviewQuestions = async (
  resumeData,
  options = {}
) => {
  const {
    targetRole = "",
    experienceLevel = "",
    count = 10,
  } = options;

  const safeCount = Math.min(
    Math.max(
      Number(count) || 10,
      1
    ),
    20
  );

  const prompt = `
Generate contextual interview questions
based on this resume.

Target role:
${limitText(targetRole, 1500) || "Not specified"}

Experience level:
${limitText(experienceLevel, 1000) || "Not specified"}

Resume:
${buildResumeContext(resumeData)}

Generate ${safeCount} questions.

Return JSON:

{
  "questions": [
    {
      "question": "",
      "category": "technical",
      "reason": ""
    }
  ]
}

Categories may include:
- technical
- behavioral
- project
- experience
- skills
- situational

Questions must be grounded in the resume.
`;

  return generateAIJSON({
    prompt,
    systemInstruction:
      "You are an interview preparation assistant. " +
      "Return valid JSON only.",
    temperature: 0.35,
  });
};

/* =========================================================
   INTERVIEW ANSWER SUGGESTION
   ========================================================= */

/**
 * Generates a suggested answer structure.
 */
export const suggestInterviewAnswer = async (
  question,
  resumeData,
  options = {}
) => {
  const {
    answerStyle = "STAR",
  } = options;

  const prompt = `
Help the candidate prepare an interview answer.

Interview question:
${limitText(question, 5000)}

Answer framework:
${limitText(answerStyle, 500)}

Resume:
${buildResumeContext(resumeData)}

Requirements:
- Use only information available in the resume.
- Do not fabricate experience.
- Do not fabricate achievements.
- Give a natural answer.
- Make it easy for the candidate to personalize.

Return:
1. Suggested answer
2. Key points
3. Personalization tips
`;

  return generateAIText({
    prompt,
    systemInstruction:
      "You are an interview coach. " +
      "Never fabricate candidate experience.",
    temperature: 0.4,
    maxOutputTokens: 1200,
  });
};

/* =========================================================
   PROFILE / RESUME SUMMARY
   ========================================================= */

/**
 * Generates a professional resume summary.
 */
export const generateProfessionalSummary = async (
  resumeData,
  targetRole = ""
) => {
  const prompt = `
Create a professional resume summary.

Target role:
${limitText(targetRole, 1500) || "Not specified"}

Resume:
${buildResumeContext(resumeData)}

Rules:
- 3 to 5 sentences.
- Professional.
- ATS-friendly.
- Natural.
- No invented experience.
- No invented metrics.
- Highlight only information supported by the resume.

Return only the summary.
`;

  return generateAIText({
    prompt,
    systemInstruction:
      "You are a professional resume summary writer.",
    temperature: 0.35,
    maxOutputTokens: 700,
  });
};

/* =========================================================
   PROJECT DESCRIPTION
   ========================================================= */

/**
 * Improves a project description.
 */
export const improveProjectDescription = async (
  project,
  targetRole = ""
) => {
  const prompt = `
Improve this project description for a professional resume.

Target role:
${limitText(targetRole, 1500) || "Not specified"}

Project:
${limitText(project, 8000)}

Requirements:
- Preserve factual information.
- Highlight technology and contribution.
- Use strong action verbs.
- Keep it concise.
- Make it ATS-friendly.
- Do not invent features or results.

Return the improved project description.
`;

  return generateAIText({
    prompt,
    systemInstruction:
      "You are a technical resume editor.",
    temperature: 0.3,
    maxOutputTokens: 900,
  });
};

/* =========================================================
   AI FEATURE AVAILABILITY
   ========================================================= */

/**
 * Checks whether the AI service is configured.
 */
export const isAIConfigured = () => {
  return Boolean(
    GEMINI_API_KEY
  );
};

/* =========================================================
   AI SERVICE INFORMATION
   ========================================================= */

export const getAIServiceInfo = () => ({
  provider: "Google Gemini",
  model: DEFAULT_MODEL,
  configured: isAIConfigured(),
  service: "Smart Resume Builder AI Service",
});

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const aiService = {
  generateAIText,
  generateAIJSON,

  improveResume,
  improveSentence,
  improveAchievement,

  suggestActionVerbs,
  suggestIndustryKeywords,

  analyzeSkillGap,
  analyzeResumeQuality,
  analyzeHumanVsAIStyle,

  generateInterviewQuestions,
  suggestInterviewAnswer,

  generateProfessionalSummary,
  improveProjectDescription,

  isAIConfigured,
  getAIServiceInfo,
};

export default aiService;