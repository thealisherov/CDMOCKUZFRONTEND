export const countWords = (text) => {
  if (!text || text.trim() === "") return 0;
  return text.trim().split(/\s+/).length;
};
