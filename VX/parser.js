/**
 * Normalize and parse values that may contain malformed or stringified JSON.
 * Works for fields like: periods, typochronological_units, ecochronological_units, references
 */
export function parseMalformedJson(val) {
  if (val === null || val === undefined) return [];
  
  // Already an array or object → return directly
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return [val];

  // Trim and handle empty strings
  let str = String(val).trim();
  if (!str || str === "[]" || str === "{}") return [];

  try {
    // Try direct parse first
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    try {
      // Clean up common malformations (double quotes, escape noise)
      let fixed = str
        .replace(/""/g, '"')
        .replace(/\\"/g, '"')
        .replace(/\s*\n\s*/g, " ")
        .replace(/^[\[{]+|[\]}]+$/g, ""); // strip outer brackets if broken

      // Split values if comma-separated or semicolon-separated
      const tokens = fixed
        .split(/[,;]+/)
        .map(t => t.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);

      return tokens;
    } catch (e2) {
      // Fallback: return as single value array
      return [str];
    }
  }
}

/**
 * Formats an array of reference objects into a readable string.
 * @param {Array<Object>|string|null} refs - The references to format.
 * @returns {string} A formatted string of references, or '—' if none are valid.
 */
export function parseReferences(refs) {
  if (!refs) return '—';

  let references = [];
  if (typeof refs === 'string') {
    try {
      references = JSON.parse(refs);
    } catch (e) {
      return refs; // Return the original string if it's not valid JSON
    }
  } else {
    references = refs;
  }

  if (!Array.isArray(references)) {
    return '—';
  }

  const formattedRefs = references
    .map(ref => {
      if (typeof ref === 'object' && ref !== null && ref.author && ref.year) {
        return `${ref.author} (${ref.year})`;
      }
      return null;
    })
    .filter(Boolean) // Remove null entries
    .join('; ');

  return formattedRefs || '—';
}
