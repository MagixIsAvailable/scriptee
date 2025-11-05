// js/state.js

export const state = {
    saveTimeout: null,
    LOCAL_STORAGE_KEY: 'mini-production-toolkit-project',
    autocomplete: {
        active: false,
        suggestions: [],
        selectedIndex: -1,
        targetElement: null,
        word: ''
    },
    sections: ['script', 'storyboard', 'shotlist'],
    elementTypes: ['script-action', 'script-character', 'script-parenthetical', 'script-transition', 'script-scene-heading'],
};

export function setSaveStatus(status) {
    const el = document.getElementById('save-status');
    if (!el) return;
    // Clear existing color classes
    el.classList.remove('bg-green-200', 'text-green-800', 'bg-red-200', 'text-red-800', 'bg-yellow-200', 'text-yellow-800', 'bg-gray-200', 'text-gray-600');

    switch(status) {
        case 'saving':
            el.textContent = 'Saving...';
            el.classList.add('bg-gray-200', 'text-gray-600');
            break;
        case 'saved':
            el.textContent = 'Saved to Browser';
            el.classList.add('bg-green-200', 'text-green-800');
            break;
        case 'imported':
            el.textContent = 'Imported! Saving...';
            el.classList.add('bg-yellow-200', 'text-yellow-800');
            break;
        case 'error':
            el.textContent = 'Error';
            el.classList.add('bg-red-200', 'text-red-800');
            break;
        case 'offline':
            el.textContent = 'Offline';
            el.classList.add('bg-gray-200', 'text-gray-600');
            break;
    }
}
