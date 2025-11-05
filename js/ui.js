// js/ui.js
import { state } from './state.js';
import { debouncedSave } from './data.js';
import { state as autocompleteState } from './state.js';

const navButtons = {
    'script': () => document.getElementById('nav-script'),
    'storyboard': () => document.getElementById('nav-storyboard'),
    'shotlist': () => document.getElementById('nav-shotlist')
};
const sectionElements = {
    'script': () => document.getElementById('section-script'),
    'storyboard': () => document.getElementById('section-storyboard'),
    'shotlist': () => document.getElementById('section-shotlist')
};

export function showSection(sectionId) {
    state.sections.forEach(id => {
        const isTarget = id === sectionId;
        sectionElements[id]().classList.toggle('hidden', !isTarget);
        navButtons[id]().classList.toggle('nav-button-active', isTarget);
        navButtons[id]().classList.toggle('nav-button-inactive', !isTarget);
    });
}

export function getSelectionParent() {
    let parent = window.getSelection().anchorNode;
    if (!parent) return null;
    if (parent.nodeType != Node.ELEMENT_NODE) parent = parent.parentNode;
    while (parent && parent.parentNode && parent.parentNode.id !== 'script-editor') parent = parent.parentNode;
    return (parent && parent.parentNode && parent.parentNode.id === 'script-editor') ? parent : null;
}

export function setSelection(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    if (el.childNodes.length > 0) {
         range.setStart(el.childNodes[0], el.childNodes[0].length || 0);
    } else {
        range.setStart(el, 0);
    }
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
}

export function changeCurrentElementType(newType) {
    const currentEl = getSelectionParent();
    if (currentEl) {
        currentEl.className = newType;
        setSelection(currentEl);
        debouncedSave();
    } else {
        const newEl = document.createElement('div');
        newEl.className = newType;
        document.getElementById('script-editor').appendChild(newEl);
        setSelection(newEl);
        debouncedSave();
    }
}

// --- Autocomplete UI ---
export function showAutocomplete(suggestions, rect) {
    const container = document.getElementById('autocomplete-suggestions');
    if (!container || suggestions.length === 0) {
        hideAutocomplete();
        return;
    }

    container.innerHTML = '';
    suggestions.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${index === autocompleteState.selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`;
        div.textContent = item;
        div.dataset.index = index;
        container.appendChild(div);
    });

    const editorRect = document.getElementById('script-editor').getBoundingClientRect();
    container.style.left = `${rect.left - editorRect.left}px`;
    container.style.top = `${rect.bottom - editorRect.top + 5}px`;
    container.classList.remove('hidden');
    autocompleteState.active = true;
    autocompleteState.suggestions = suggestions;
}

export function hideAutocomplete() {
    const container = document.getElementById('autocomplete-suggestions');
    if (container) container.classList.add('hidden');
    autocompleteState.active = false;
    autocompleteState.suggestions = [];
    autocompleteState.selectedIndex = -1;
    autocompleteState.targetElement = null;
}
