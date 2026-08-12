const STORAGE_KEY = "resume_profiles";

export const saveProfiles = (profiles) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(profiles)
  );
};

export const loadProfiles = () => {
  const data =
    localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const deleteProfiles = () => {
  localStorage.removeItem(STORAGE_KEY);
};