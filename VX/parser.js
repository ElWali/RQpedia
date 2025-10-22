/**
 * parser.js - Final, bulletproof version
 *
 * Handles double-escaped JSON strings like: "[{\"\"reference\"\": \"\"Poti 2019\"\"}]"
 * Also sanitizes output to ensure no escaped quotes remain.
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
            return sanitizeOutput(parsed);
        }
        if (parsed !== null && typeof parsed === 'object') {
            return sanitizeOutput([parsed]);
        }
        return [];
    } catch (e) {
        // Continue to recovery strategies
    }

    // Attempt 2: Normalize and retry with aggressive quote unescaping
    try {
        let v = val;

        // Step 1: Recursively replace "" with " until stable
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

        // Also handle comma-separated objects without brackets
        if (/^\{.*\}\s*,\s*\{.*\}$/.test(v) && !/^\[.*\]$/.test(v)) {
            v = `[${v}]`;
        }

        // Attempt to parse again
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

    // Attempt 3: Heuristic parsing for flat key-value strings
    try {
        let stripped = val.replace(/^[\[\]"\s]+|[\[\]"\s]+$/g, '').trim();
        if (!stripped) {
            return [];
        }

        const parts = stripped.split(/\}\s*,\s*\{/).map(part => {
            return part
                .replace(/^\s*\{?/, '')
                .replace(/\}?\s*$/, '');
        }).filter(part => part.trim() !== '');

        if (parts.length === 0) {
            return [];
        }

        const result = parts.map(part => {
            const obj = {};
            const pairs = part.split(/\s*,\s*/).filter(kv => kv.trim() !== '');

            for (const kv of pairs) {
                let match = kv.match(/^"([^"]+)"\s*:\s*"([^"]*)"$/);
                if (match) {
                    obj[match[1]] = match[2];
                    continue;
                }

                match = kv.match(/^"([^"]+)"\s*:\s*(.*)$/);
                if (match) {
                    let value = match[2].trim();
                    if (/^".*"$/.test(value)) {
                        value = value.slice(1, -1);
                    }
                    obj[match[1]] = value;
                    continue;
                }

                match = kv.match(/^([^:]+):\s*(.*)$/);
                if (match) {
                    let key = match[1].trim();
                    let value = match[2].trim();
                    if (/^".*"$/.test(key)) key = key.slice(1, -1);
                    if (/^".*"$/.test(value)) value = value.slice(1, -1);
                    obj[key] = value;
                }
            }
            return obj;
        });

        return sanitizeOutput(result);
    } catch (e) {
        return [];
    }
}

/**
 * Sanitizes output by recursively cleaning any remaining escaped quotes
 * in keys and values.
 */
function sanitizeOutput(data) {
    if (Array.isArray(data)) {
        return data.map(item => sanitizeOutput(item));
    }
    if (typeof data === 'object' && data !== null) {
        const cleaned = {};
        for (let key in data) {
            let cleanKey = key;
            let cleanValue = data[key];

            // Clean key
            if (typeof cleanKey === 'string') {
                cleanKey = cleanKey.replace(/""/g, '"').replace(/"/g, '');
            }

            // Clean value
            if (typeof cleanValue === 'string') {
                cleanValue = cleanValue.replace(/""/g, '"').replace(/"/g, '');
            } else if (typeof cleanValue === 'object' && cleanValue !== null) {
                cleanValue = sanitizeOutput(cleanValue);
            }

            cleaned[cleanKey] = cleanValue;
        }
        return cleaned;
    }
    return data;
}

// Export for use in modules (Node.js or bundlers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = parseMalformedJson;
}
