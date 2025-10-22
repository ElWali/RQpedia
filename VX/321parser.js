/**
 * parser.js
 *
 * A resilient parser for malformed JSON strings commonly found in dirty datasets.
 * Handles:
 *   - Double-escaped quotes: ""key"" → "key"
 *   - Missing array brackets around objects
 *   - Literal \n and excessive whitespace
 *   - Fallback heuristic parsing for flat key-value structures
 *   - Final sanitization of keys and string values to remove any lingering quotes
 *
 * Always returns an array of plain objects. Never throws.
 *
 * Example input:  '[{\"\"reference\"\": \"\"Poti 2019\"\"}]'
 * Example output: [{ reference: "Poti 2019" }]
 */

/**
 * Main parsing function.
 * @param {any} val - Input value of any type.
 * @returns {Array<Object>} Always an array of plain objects.
 */
function parseMalformedJson(val) {
    // Handle nullish values, but preserve numeric 0
    if (val == null && val !== 0) {
        return [];
    }

    // If already an array, return as-is
    if (Array.isArray(val)) {
        return sanitizeOutput(val);
    }

    // If already a non-null object, wrap in array
    if (typeof val === 'object' && val !== null) {
        return sanitizeOutput([val]);
    }

    // Non-string values cannot be parsed as malformed JSON strings
    if (typeof val !== 'string') {
        return [];
    }

    // Attempt 1: Standard JSON.parse
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
            return sanitizeOutput(parsed);
        }
        if (parsed !== null && typeof parsed === 'object') {
            return sanitizeOutput([parsed]);
        }
        return [];
    } catch (e) {
        // Continue to recovery strategies
    }

    // Attempt 2: Normalize and retry parsing
    try {
        let v = val;

        // Recursively collapse all "" into " until stable
        let prev;
        do {
            prev = v;
            v = v.replace(/""/g, '"');
        } while (prev !== v);

        // Normalize whitespace and escape sequences
        v = v
            .replace(/\\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Wrap lone object or comma-separated objects in array brackets if needed
        if (/^\{.*\}$/.test(v) && !/^\[.*\]$/.test(v)) {
            v = `[${v}]`;
        } else if (/^\{.*\}\s*,\s*\{.*\}$/.test(v) && !/^\[.*\]$/.test(v)) {
            v = `[${v}]`;
        }

        // Final parse attempt
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) {
            return sanitizeOutput(parsed);
        }
        if (parsed !== null && typeof parsed === 'object') {
            return sanitizeOutput([parsed]);
        }
        return [];
    } catch (e) {
        // Proceed to heuristic fallback
    }

    // Attempt 3: Heuristic parsing for flat key-value pairs
    try {
        // Strip outer brackets, quotes, and whitespace
        let stripped = val.replace(/^[\[\]"\s]+|[\[\]"\s]+$/g, '').trim();
        if (!stripped) {
            return [];
        }

        // Split on '},{' patterns (with optional surrounding whitespace)
        const parts = stripped.split(/\}\s*,\s*\{/).map(part => {
            return part
                .replace(/^\s*\{?/, '')   // Remove optional leading {
                .replace(/\}?\s*$/, '');  // Remove optional trailing }
        }).filter(part => part.trim() !== '');

        if (parts.length === 0) {
            return [];
        }

        const result = parts.map(part => {
            const obj = {};
            const pairs = part.split(/\s*,\s*/).filter(kv => kv.trim() !== '');

            for (const kv of pairs) {
                // Case 1: Strictly quoted "key":"value"
                let match = kv.match(/^"([^"]+)"\s*:\s*"([^"]*)"$/);
                if (match) {
                    obj[match[1]] = match[2];
                    continue;
                }

                // Case 2: Quoted key, possibly quoted value
                match = kv.match(/^"([^"]+)"\s*:\s*(.*)$/);
                if (match) {
                    let value = match[2].trim();
                    if (/^".*"$/.test(value)) {
                        value = value.slice(1, -1);
                    }
                    obj[match[1]] = value;
                    continue;
                }

                // Case 3: Unquoted key:value
                match = kv.match(/^([^:]+):\s*(.*)$/);
                if (match) {
                    let key = match[1].trim();
                    let value = match[2].trim();
                    if (/^".*"$/.test(key)) key = key.slice(1, -1);
                    if (/^".*"$/.test(value)) value = value.slice(1, -1);
                    obj[key] = value;
                }
                // Skip unparseable pairs silently
            }
            return obj;
        });

        return sanitizeOutput(result);
    } catch (e) {
        return [];
    }
}

/**
 * Recursively sanitizes parsed output:
 * - Removes any remaining double quotes from string keys and values
 * - Ensures clean, display-ready data
 * @param {any} data - Parsed data (array, object, primitive)
 * @returns {any} Sanitized data
 */
function sanitizeOutput(data) {
    if (Array.isArray(data)) {
        return data.map(item => sanitizeOutput(item));
    }

    if (typeof data === 'object' && data !== null) {
        const cleaned = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let cleanKey = key;
                let cleanValue = data[key];

                // Sanitize key if it's a string
                if (typeof cleanKey === 'string') {
                    cleanKey = cleanKey.replace(/"/g, '');
                }

                // Sanitize value
                if (typeof cleanValue === 'string') {
                    cleanValue = cleanValue.replace(/"/g, '');
                } else if (typeof cleanValue === 'object' && cleanValue !== null) {
                    cleanValue = sanitizeOutput(cleanValue);
                }

                cleaned[cleanKey] = cleanValue;
            }
        }
        return cleaned;
    }

    return data;
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = parseMalformedJson;
}

// Export for ES modules (optional, if used in modern bundlers)
// Note: This is not needed if you're using CommonJS or plain browser script
// export default parseMalformedJson;
