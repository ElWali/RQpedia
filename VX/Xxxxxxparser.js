/**
 * parser.js — Customized for your output.json structure
 *
 * Input example:
 *   [{ "reference": "[{\"\"reference\"\": \"\"van Willigen 2008\"\"}" }]
 *
 * Output:
 *   [{ reference: "van Willigen 2008" }]
 */

function parseMalformedJson(val) {
    // If already a clean array of objects with string values, return as-is
    if (Array.isArray(val)) {
        if (val.length === 0) return [];
        const first = val[0];
        if (typeof first === 'object' && first !== null) {
            // Check if it's already clean: { reference: "text" }
            if (typeof first.reference === 'string' && !first.reference.trim().startsWith('[')) {
                return val;
            }
        }
    }

    // If input is not an array, wrap it
    const inputArray = Array.isArray(val) ? val : (val ? [val] : []);

    const result = [];

    for (const item of inputArray) {
        if (typeof item === 'string') {
            // Direct string case: parse it
            const parsed = parseReferenceString(item);
            if (parsed.length > 0) {
                result.push(...parsed);
            }
        } else if (item && typeof item === 'object' && item.reference != null) {
            if (typeof item.reference === 'string') {
                // Handle: { reference: "[{\"\"ref\"\": \"\"text\"\"}" }
                const parsed = parseReferenceString(item.reference);
                if (parsed.length > 0) {
                    result.push(...parsed);
                } else {
                    // Fallback: treat the string as literal reference text
                    const cleaned = cleanString(item.reference);
                    if (cleaned) {
                        result.push({ reference: cleaned });
                    }
                }
            } else if (typeof item.reference === 'object') {
                // Already parsed? Just sanitize
                result.push({ reference: cleanString(item.reference.reference) || '' });
            }
        }
    }

    return result.length ? result : [];
}

/**
 * Parses a malformed reference string like:
 *   "[{\"\"reference\"\": \"\"van Willigen 2008\"\"}"
 * and returns [{ reference: "van Willigen 2008" }]
 */
function parseReferenceString(str) {
    if (typeof str !== 'string') return [];

    // Step 1: Fix double quotes
    let fixed = str.replace(/""/g, '"');

    // Step 2: Ensure it ends with ] if it starts with [
    if (fixed.startsWith('[') && !fixed.endsWith(']')) {
        fixed = fixed + ']';
    }

    // Step 3: Ensure valid JSON object structure inside
    // If it looks like [{"reference": "..."} but missing closing }]
    if (fixed.startsWith('[{') && fixed.endsWith('}')) {
        fixed = fixed + ']';
    }

    // Step 4: Try to parse
    try {
        const parsed = JSON.parse(fixed);
        if (Array.isArray(parsed)) {
            return parsed.map(obj => {
                if (obj && typeof obj === 'object' && obj.reference) {
                    return { reference: cleanString(obj.reference) };
                }
                return { reference: cleanString(String(obj)) };
            }).filter(item => item.reference);
        } else if (parsed && typeof parsed === 'object' && parsed.reference) {
            return [{ reference: cleanString(parsed.reference) }];
        }
    } catch (e) {
        // Fallback: treat entire string as reference text
    }

    // Last resort: extract text heuristically
    const heuristic = extractReferenceText(str);
    if (heuristic) {
        return [{ reference: heuristic }];
    }

    return [];
}

/**
 * Clean a string from any remaining quotes or escapes
 */
function cleanString(s) {
    if (typeof s !== 'string') return '';
    return s
        .replace(/"/g, '')
        .replace(/\\"/g, '')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Heuristic fallback to extract "van Willigen 2008" from messy strings
 */
function extractReferenceText(str) {
    if (typeof str !== 'string') return '';
    // Try to find pattern like: ...reference... : ...text...
    const match = str.match(/(?:reference|Reference|REFERENCE)[^a-zA-Z0-9]*[:=][^a-zA-Z0-9]*["']?([a-zA-Z].*?\d{4})/);
    if (match) {
        return cleanString(match[1]);
    }
    // Fallback: remove all JSON-like syntax and keep alphanumeric + spaces
    let cleaned = str
        .replace(/[\[\]{}"']/g, ' ')
        .replace(/reference/gi, '')
        .replace(/:/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return cleaned || '';
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = parseMalformedJson;
}
