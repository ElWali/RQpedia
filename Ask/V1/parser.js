function parseMalformedJson(jsonString) {
    if (typeof jsonString !== 'string') {
        return [];
    }
    try {
        const cleanedString = jsonString.replace(/\\"/g, '"').replace(/^"|"$/g, '');
        const parsed = JSON.parse(cleanedString);
        if (typeof parsed === 'string') {
            return JSON.parse(parsed);
        }
        return parsed;
    } catch (e) {
        return [];
    }
}
