// js/handlers.js
import { state } from './state.js';
import { getUniqueValues } from './autocomplete.js';
import { showAutocomplete, hideAutocomplete, getSelectionParent, setSelection } from './ui.js';
import { debouncedSave } from './data.js';

const elementTypes = ['script-action', 'script-character', 'script-parenthetical', 'script-dialog', 'script-transition', 'script-scene-heading'];

export function handleScriptKeydown(e) {
    if (state.autocomplete.active) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            state.autocomplete.selectedIndex = (state.autocomplete.selectedIndex + 1) % state.autocomplete.suggestions.length;
            showAutocomplete(state.autocomplete.suggestions, state.autocomplete.targetElement.getBoundingClientRect());
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            state.autocomplete.selectedIndex = (state.autocomplete.selectedIndex - 1 + state.autocomplete.suggestions.length) % state.autocomplete.suggestions.length;
            showAutocomplete(state.autocomplete.suggestions, state.autocomplete.targetElement.getBoundingClientRect());
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            handleAutocompleteSelection();
            return;
        }
        if (e.key === 'Escape') {
            hideAutocomplete();
            return;
        }
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        const currentEl = getSelectionParent();
        let nextClass = 'script-action';
        if (currentEl) {
            const currentClass = currentEl.className;
            if (currentClass.includes('script-scene-heading')) nextClass = 'script-action';
            else if (currentClass.includes('script-action')) nextClass = 'script-character';
            else if (currentClass.includes('script-character')) nextClass = 'script-dialog';
            else if (currentClass.includes('script-dialog')) nextClass = 'script-character';
            else if (currentClass.includes('script-parenthetical')) nextClass = 'script-dialog';
            else if (currentClass.includes('script-transition')) nextClass = 'script-scene-heading';
        }
        const newEl = document.createElement('div');
        newEl.className = nextClass;
        if (currentEl) currentEl.after(newEl);
        else document.getElementById('script-editor').appendChild(newEl);
        setSelection(newEl);
        debouncedSave();
    }

    if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const currentEl = getSelectionParent();
        if (currentEl && currentEl.textContent.trim() === '') {
            const currentClass = currentEl.className;
            let currentIndex = elementTypes.indexOf(currentClass);
            if (currentIndex === -1) currentIndex = 0; // Default to first type if not found
            const nextIndex = (currentIndex + 1) % elementTypes.length;
            currentEl.className = elementTypes[nextIndex];
            debouncedSave();
        }
    }
}

export function checkAutocomplete() {
    const currentEl = getSelectionParent();
    if (!currentEl) {
        hideAutocomplete();
        return;
    }

    const className = currentEl.className;
    if (className.includes('script-character') || className.includes('script-scene-heading')) {
        const text = currentEl.textContent || '';
        const words = text.split(/[\s(]+/);
        const currentWord = words[words.length - 1];

        if (currentWord.length > 0) {
            const sourceValues = getUniqueValues(className);
            const filtered = sourceValues.filter(v => v.toLowerCase().startsWith(currentWord.toLowerCase()) && v.toLowerCase() !== currentWord.toLowerCase());

            if (filtered.length > 0) {
                const selection = window.getSelection();
                if (selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                state.autocomplete.targetElement = currentEl;
                state.autocomplete.word = currentWord;
                showAutocomplete(filtered, rect);
            } else {
                hideAutocomplete();
            }
        } else {
            hideAutocomplete();
        }
    } else {
        hideAutocomplete();
    }
}

export function handleAutocompleteSelection() {
    if (state.autocomplete.selectedIndex === -1) return;

    const selectedValue = state.autocomplete.suggestions[state.autocomplete.selectedIndex];
    const target = state.autocomplete.targetElement;
    if (!target) return;

    const fullText = target.textContent;
    const lastWordIndex = fullText.lastIndexOf(state.autocomplete.word);
    target.textContent = fullText.substring(0, lastWordIndex) + selectedValue;

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(target);
range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    hideAutocomplete();
    debouncedSave();
}
