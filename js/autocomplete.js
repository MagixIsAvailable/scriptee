// js/autocomplete.js

export function getUniqueValues(className) {
    const editor = document.getElementById('script-editor');
    const elements = editor.querySelectorAll(`.${className}`);
    const values = new Set();
    elements.forEach(el => {
        const text = className === 'script-scene-heading'
            ? el.textContent.replace(/^(INT\.|EXT\.)\s*/, '').replace(/\s*-\s*(DAY|NIGHT|MORNING|EVENING|LATER)$/, '')
            : el.textContent;
        if (text.trim()) values.add(text.trim());
    });
    return Array.from(values);
}
