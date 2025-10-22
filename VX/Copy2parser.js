/**
 * parser.js
 *
 * Robust parser for malformed JSON strings with double-escaped quotes.
 * Handles:
 *   - Double-escaped quotes: ""key"" → "key"
 *   - Triple-escaped quotes: """key""" → "key" (optional)
 *   - Missing array brackets
 *   - Extra whitespace
 *   - Fallback heuristic for flat key-value structures
 *
 * @param {any} val - Input value (string, array, object, etc.)
 * @returns {Array} - Always returns an array of objects (never throws)
 */
function parseMalformedJson(val) {
    // Return early for nullish values, except numeric 0
    if (val == null && val !== 0) {
        return [];
    }

    // If already a valid array or non-null object, return as-is
    if (Array.isArray(val)) {
        return val;
    }
    if (typeof val === 'object' && val !== null) {
        return [val];
    }

    // Non-string values are not valid JSON containers here
    if (typeof val !== 'string') {
        return [];
    }

    // Attempt 1: Direct JSON.parse
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        if (parsed !== null && typeof parsed === 'object') {
            return [parsed];
        }
        return [];
    } catch (e) {
        // Continue to recovery strategies
    }

    // Attempt 2: Normalize and retry with aggressive quote unescaping
    try {
        let v = val;

        // Step 1: Replace all instances of "" with ", recursively until no change
        let prev;
        do {
            prev = v;
            v = v.replace(/""/g, '"');
        } while (prev !== v);

        // Step 2: Remove literal \n and collapse whitespace
        v = v
            .replace(/\\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Step 3: Wrap lone object(s) in array if needed
        if (/^\{.*\}$/.test(v) && !/^\[.*\]$/.test(v)) {
            v = `[${v}]`;
        }

        // Also handle comma-separated objects without brackets: {...}, {...}
        if (/^\{.*\}\s*,\s*\{.*\}$/.test(v) && !/^\[.*\]$/.test(v)) {
            v = `[${v}]`;
        }

        // Attempt to parse again
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        if (parsed !== null && typeof parsed === 'object') {
            return [parsed];
        }
        return [];
    } catch (e) {
        // Proceed to heuristic fallback
    }

    // Attempt 3: Heuristic parsing for flat key-value strings
    try {
        // Strip leading/trailing brackets, quotes, and whitespace
        let stripped = val.replace(/^[\[\]"\s]+|[\[\]"\s]+$/g, '').trim();
        if (!stripped) {
            return [];
        }

        // Split on '},{' patterns (with optional whitespace)
        const parts = stripped.split(/\}\s*,\s*\{/).map(part => {
            return part
                .replace(/^\s*\{?/, '')   // Remove leading { (if any)
                .replace(/\}?\s*$/, '');  // Remove trailing } (if any)
        }).filter(part => part.trim() !== '');

        if (parts.length === 0) {
            return [];
        }

        const result = parts.map(part => {
            const obj = {};
            const pairs = part.split(/\s*,\s*/).filter(kv => kv.trim() !== '');

            for (const kv of pairs) {
                // First try: strictly quoted "key":"value"
                let match = kv.match(/^"([^"]+)"\s*:\s*"([^"]*)"$/);
                if (match) {
                    obj[match[1]] = match[2];
                    continue;
                }

                // Second try: quoted key, unquoted or partially quoted value
                match = kv.match(/^"([^"]+)"\s*:\s*(.*)$/);
                if (match) {
                    let value = match[2].trim();
                    // Remove surrounding quotes if present
                    if (/^".*"$/.test(value)) {
                        value = value.slice(1, -1);
                    }
                    obj[match[1]] = value;
                    continue;
                }

                // Third try: unquoted key:value (simple tokens only)
                match = kv.match(/^([^:]+):\s*(.*)$/);
                if (match) {
                    let key = match[1].trim();
                    let value = match[2].trim();

                    // Remove surrounding quotes from key and value if present
                    if (/^".*"$/.test(key)) key = key.slice(1, -1);
                    if (/^".*"$/.test(value)) value = value.slice(1, -1);

                    obj[key] = value;
                }
                // If no match, skip the pair (avoid polluting with garbage)
            }

            return obj;
        });

        return result;
    } catch (e) {
        // Final fallback: return empty array on any error
        return [];
    }
}

// Export for use in modules (Node.js or bundlers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = parseMalformedJson;
}
