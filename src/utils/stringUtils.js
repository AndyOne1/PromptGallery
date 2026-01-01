/**
 * Normalizes prompt text for consistent comparison.
 * Trims whitespace, converts to lowercase, and collapses multiple spaces.
 */
export const normalizePromptText = (text) => {
    if (!text) return '';
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
};
