// Main application JS (module)
import { loadProjectData, debouncedSave, importProject, exportProject } from './js/data.js';
import { showSection, changeCurrentElementType } from './js/ui.js';
import { handleScriptKeydown, checkAutocomplete, handleAutocompleteSelection } from './js/handlers.js';
import { state } from './js/state.js';
import { initializeHistory } from './js/history.js';

// --- Initialize App ---
function initializeApp() {
    // Assign functions to window object so they can be called from HTML
    window.showSection = showSection;
    window.changeCurrentElementType = changeCurrentElementType;
    window.importProject = importProject;
    window.exportProject = exportProject;

    loadProjectData();
    attachAppListeners();
    initializeHistory();
}

// --- Attach listeners after data load ---
function attachAppListeners() {
    const scriptEditor = document.getElementById('script-editor');
    scriptEditor.addEventListener('keydown', handleScriptKeydown);
    scriptEditor.addEventListener('input', () => {
        debouncedSave();
        checkAutocomplete();
    });

    // Autocomplete click
    document.getElementById('autocomplete-suggestions').addEventListener('mousedown', (e) => {
        if (e.target.dataset.index) {
            state.autocomplete.selectedIndex = parseInt(e.target.dataset.index, 10);
            handleAutocompleteSelection();
            e.preventDefault(); // Prevent editor from losing focus
        }
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    // Set initial theme
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
        lightIcon.classList.remove('hidden');
    } else {
        document.body.classList.remove('dark');
        darkIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.body.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            if (document.body.classList.contains('dark')) {
                document.body.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.body.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });

    // Shortcuts Modal
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const openShortcutsButton = document.getElementById('shortcuts-open-button');
    const closeShortcutsButton = document.getElementById('shortcuts-close-button');

    openShortcutsButton.addEventListener('click', () => shortcutsModal.classList.remove('hidden'));
    closeShortcutsButton.addEventListener('click', () => shortcutsModal.classList.add('hidden'));
    shortcutsModal.addEventListener('click', (e) => {
        if (e.target === shortcutsModal) {
            shortcutsModal.classList.add('hidden');
        }
    });

    // Click below script to add new line
    document.getElementById('section-script').addEventListener('click', (e) => {
        const scriptEditor = document.getElementById('script-editor');
        const rect = scriptEditor.getBoundingClientRect();
        // If click is inside the section but below the editor content
        if (e.clientY > rect.bottom) {
            const lastEl = scriptEditor.lastElementChild;
            const newEl = document.createElement('div');
            newEl.className = 'script-action'; // Default to action
            if (lastEl) {
                lastEl.after(newEl);
            } else {
                scriptEditor.appendChild(newEl);
            }
            setSelection(newEl);
        }
    });

    document.getElementById('add-storyboard-panel').addEventListener('click', () => {
        const grid = document.getElementById('storyboard-grid');
        const panelCount = grid.children.length + 1;
        const panel = document.createElement('div');
        panel.className = 'bg-white rounded-lg shadow-md overflow-hidden storyboard-panel';
        panel.dataset.id = crypto.randomUUID();
        panel.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">Panel ${panelCount}</h3>
                    <button class="delete-panel text-gray-400 hover:text-red-500" title="Delete panel">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
                <div class="sb-image-container aspect-video bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 relative overflow-hidden">
                    <img src="" class="sb-image w-full h-full object-cover" alt="Storyboard Image">
                    <div class="sb-image-placeholder text-gray-500 text-sm p-4 text-center">Click to add image</div>
                    <button class="sb-remove-image absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold" title="Remove image">&times;</button>
                    <input type="file" class="sb-image-input hidden" accept="image/*">
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Notes / Dialogue</label>
                    <textarea class="sb-notes w-full h-24 p-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Add notes..."></textarea>
                </div>
            </div>`;
        grid.appendChild(panel);
        debouncedSave();
    });

    document.getElementById('add-shot').addEventListener('click', () => {
        const body = document.getElementById('shot-list-body');
        const shotCount = body.children.length + 1;
        const row = document.createElement('tr');
        row.className = 'shot-list-row';
        row.dataset.id = crypto.randomUUID();
        row.innerHTML = `
            <td data-label="Shot #" class="px-4 py-3 whitespace-nowrap"><span class="text-sm font-medium text-gray-900 shot-number">${shotCount}</span></td>
            <td data-label="Scene #" class="px-4 py-3"><input type="text" class="sl-scene w-20 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="1A"></td>
            <td data-label="Shot Type" class="px-4 py-3"><input type="text" class="sl-type w-28 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., MCU, WS"></td>
            <td data-label="Description" class="px-4 py-3"><textarea class="sl-desc w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Shot description..."></textarea></td>
            <td data-label="Notes" class="px-4 py-3"><textarea class="sl-notes w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Lens, gear, etc..."></textarea></td>
            <td data-label="Actions" class="px-4 py-3 text-center">
                <button class="delete-shot text-gray-400 hover:text-red-500" title="Delete shot">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
            </td>`;
        body.appendChild(row);
        debouncedSave();
    });

    document.body.addEventListener('input', (e) => {
        if (e.target.closest('#section-storyboard') || e.target.closest('#section-shotlist')) {
            if (e.target.matches('.sb-image-input')) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const container = e.target.closest('.sb-image-container');
                    container.classList.add('has-image');
                    container.querySelector('.sb-image').src = event.target.result;
                    debouncedSave();
                };
                reader.readAsDataURL(file);
            } else {
                debouncedSave();
            }
        }
    });

    document.body.addEventListener('click', (e) => {
        const deletePanelButton = e.target.closest('.delete-panel');
        if (deletePanelButton) {
            deletePanelButton.closest('.storyboard-panel').remove();
            document.querySelectorAll('#storyboard-grid .storyboard-panel').forEach((panel, index) => {
                panel.querySelector('h3').textContent = `Panel ${index + 1}`;
            });
            debouncedSave();
        }

        const deleteShotButton = e.target.closest('.delete-shot');
        if (deleteShotButton) {
            deleteShotButton.closest('.shot-list-row').remove();
            document.querySelectorAll('#shot-list-body .shot-list-row').forEach((row, index) => {
                row.querySelector('.shot-number').textContent = index + 1;
            });
            debouncedSave();
        }

        const imageContainer = e.target.closest('.sb-image-container');
        if (imageContainer && !e.target.closest('.sb-remove-image')) {
            imageContainer.querySelector('.sb-image-input').click();
        }

        const removeImageButton = e.target.closest('.sb-remove-image');
        if (removeImageButton) {
            const container = removeImageButton.closest('.sb-image-container');
            container.classList.remove('has-image');
            container.querySelector('.sb-image').src = '';
            container.querySelector('.sb-image-input').value = '';
            debouncedSave();
        }
    });

    // --- Drag and Drop & Paste for Images ---
    document.getElementById('storyboard-grid').addEventListener('paste', (e) => {
        const panel = e.target.closest('.storyboard-panel');
        if (!panel) return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                e.preventDefault();
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const container = panel.querySelector('.sb-image-container');
                    container.classList.add('has-image');
                    container.querySelector('.sb-image').src = event.target.result;
                    debouncedSave();
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    });

    document.getElementById('storyboard-grid').addEventListener('dragover', (e) => {
        e.preventDefault();
        const panel = e.target.closest('.storyboard-panel');
        if (panel) {
            panel.querySelector('.sb-image-container').classList.add('bg-indigo-100', 'border-indigo-400');
        }
    });

    document.getElementById('storyboard-grid').addEventListener('dragleave', (e) => {
        const panel = e.target.closest('.storyboard-panel');
        if (panel) {
            panel.querySelector('.sb-image-container').classList.remove('bg-indigo-100', 'border-indigo-400');
        }
    });

    document.getElementById('storyboard-grid').addEventListener('drop', (e) => {
        e.preventDefault();
        const panel = e.target.closest('.storyboard-panel');
        if (!panel) return;

        panel.querySelector('.sb-image-container').classList.remove('bg-indigo-100', 'border-indigo-400');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const container = panel.querySelector('.sb-image-container');
                    container.classList.add('has-image');
                    container.querySelector('.sb-image').src = event.target.result;
                    debouncedSave();
                };
                reader.readAsDataURL(file);
            }
            e.dataTransfer.clearData();
        }
    });

    document.getElementById('import-button').addEventListener('click', importProject);
    document.getElementById('export-button').addEventListener('click', exportProject);
    document.getElementById('export-txt-button').addEventListener('click', exportScriptAsTxt);

    // Drag and Drop for Storyboard and Shotlist
    const storyboardGrid = document.getElementById('storyboard-grid');
    if (storyboardGrid) {
        new Sortable(storyboardGrid, {
            animation: 150,
            handle: '.sb-drag-handle', // Use the new drag handle
            ghostClass: 'blue-background-class',
            onEnd: function () {
                document.querySelectorAll('#storyboard-grid .storyboard-panel').forEach((panel, index) => {
                    panel.querySelector('h3').textContent = `Panel ${index + 1}`;
                });
                debouncedSave();
            }
        });
    }

    const shotListBody = document.getElementById('shot-list-body');
    if (shotListBody) {
        new Sortable(shotListBody, {
            animation: 150,
            handle: '.shot-number',
            onEnd: function () {
                document.querySelectorAll('#shot-list-body .shot-list-row').forEach((row, index) => {
                    row.querySelector('.shot-number').textContent = index + 1;
                });
                debouncedSave();
            }
        });
    }
}

// Start the app
initializeApp();
