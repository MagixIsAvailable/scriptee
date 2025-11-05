import { renderProjectDataToDOM } from './render.js';
import { getProjectDataFromDOM } from './data.js';
import { state } from './state.js';

const history = [];
let historyIndex = -1;

const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

function updateButtonStates() {
    if (!undoButton || !redoButton) return;
    
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    undoButton.disabled = !canUndo;
    redoButton.disabled = !canRedo;

    undoButton.classList.toggle('cursor-not-allowed', !canUndo);
    undoButton.classList.toggle('text-gray-400', !canUndo);
    undoButton.classList.toggle('text-gray-600', canUndo);
    undoButton.classList.toggle('dark:text-gray-500', !canUndo);
    undoButton.classList.toggle('dark:text-gray-300', canUndo);
    undoButton.classList.toggle('hover:bg-gray-200', canUndo);
    undoButton.classList.toggle('dark:hover:bg-gray-700', canUndo);


    redoButton.classList.toggle('cursor-not-allowed', !canRedo);
    redoButton.classList.toggle('text-gray-400', !canRedo);
    redoButton.classList.toggle('text-gray-600', canRedo);
    redoButton.classList.toggle('dark:text-gray-500', !canRedo);
    redoButton.classList.toggle('dark:text-gray-300', canRedo);
    redoButton.classList.toggle('hover:bg-gray-200', canRedo);
    redoButton.classList.toggle('dark:hover:bg-gray-700', canRedo);
}

export function pushState() {
    // If we are not at the end of history, truncate it
    if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
    }

    const currentState = getProjectDataFromDOM();
    
    // Prevent pushing the same state twice
    if (historyIndex > -1 && JSON.stringify(history[historyIndex]) === JSON.stringify(currentState)) {
        return;
    }

    history.push(currentState);
    historyIndex = history.length - 1;

    // Limit history size
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }

    updateButtonStates();
}

export function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const stateToRestore = history[historyIndex];
        state.isRestoring = true; // Set flag to prevent re-saving during render
        renderProjectDataToDOM(stateToRestore);
        updateButtonStates();
    }
}

export function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const stateToRestore = history[historyIndex];
        state.isRestoring = true; // Set flag to prevent re-saving during render
        renderProjectDataToDOM(stateToRestore);
        updateButtonStates();
    }
}

export function initializeHistory() {
    // Use a small timeout to ensure the initial DOM is fully loaded
    setTimeout(() => {
        pushState(); // Push initial state
        updateButtonStates();
    }, 100);

    undoButton.addEventListener('click', undo);
    redoButton.addEventListener('click', redo);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undo();
        }
        if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
            e.preventDefault();
            redo();
        }
    });
}
