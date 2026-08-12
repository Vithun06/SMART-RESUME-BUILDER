export function calculateATSScore(resumeText, jobDescription) {
  if (!jobDescription) {
    return {
      score: 100,
      missingKeywords: [],
    };
  }

  const resumeWords = resumeText
    .toLowerCase()
    .split(/\W+/);

  const jobWords = jobDescription
    .toLowerCase()
    .split(/\W+/);

  const uniqueJobWords = [...new Set(jobWords)];

  const missingKeywords = uniqueJobWords.filter(
    (word) =>
      word.length > 3 &&
      !resumeWords.includes(word)
  );

  const matched =
    uniqueJobWords.length - missingKeywords.length;

  const score = Math.round(
    (matched / uniqueJobWords.length) * 100
  );

  return {
    score: isNaN(score) ? 100 : score,
    missingKeywords,
  };
}