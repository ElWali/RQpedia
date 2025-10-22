function parseMalformedJson(val) {
    // your dataset contains strings like: "[{\"\"periode\"\": \"\"Neolithic\"\"}]"
    // try to normalize and parse
    if (!val && val !== 0) {
        return [];
    }
    if (Array.isArray(val) || typeof val === 'object') {
        return val;
    }
    try {
        // first try direct parse
        return JSON.parse(val);
    } catch (e) {
        try {
            // fix double-escaped quotes patterns
            let v = val.replace(/""/g, '"');
            v = v.replace(/\s+\\n\s+/g, ' ');
            // if it looks like an arraylike string without outer brackets, wrap it
            if (/^\{.*\}$/.test(v) && !v.startsWith('[')) {
                v = `[${v}]`;
            }
            return JSON.parse(v);
        } catch (e2) {
            // fallback: try to extract text tokens heuristically
            const stripped = val.replace(/^[\[\]"\s]+|[\[\]"\s]+$/g, '');
            if (!stripped) {
                return [];
            }
            // split on },{ or '},{' or '},{ ' and map
            const parts = stripped.split(/\}\s*,\s*\{/).map(s => s.replace(/^[\{\}]+|[\{\}]+$/g,''));
            const out = parts.map(p => {
                const obj = {};
                p.split(/\s*,\s*/).forEach(kv => {
                    const m = kv.match(/([^:]+):\s*(.*)/) || kv.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
                    if (m) {
                        const key = m[1].replace(/^"|"$/g,'').trim();
                        const value = (m[2] || '').replace(/^"|"$/g,'').trim();
                        obj[key] = value;
                    }
                });
                return obj;
            });
            return out.length ? out : [];
        }
    }
}
