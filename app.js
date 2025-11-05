// Main application JS (module)

// --- App State ---
let saveTimeout;
const LOCAL_STORAGE_KEY = 'mini-production-toolkit-project';

// --- Save Status UI ---
function setSaveStatus(status) {
    const el = document.getElementById('save-status');
    if (!el) return;
    switch(status) {
        case 'saving':
            el.textContent = 'Saving...';
            el.classList.remove('bg-green-200', 'text-green-800', 'bg-red-200', 'text-red-800', 'bg-yellow-200', 'text-yellow-800');
            el.classList.add('bg-gray-200', 'text-gray-600');
            break;
        case 'saved':
            el.textContent = 'Saved';
            el.classList.remove('bg-gray-200', 'text-gray-600', 'bg-red-200', 'text-red-800', 'bg-yellow-200', 'text-yellow-800');
            el.classList.add('bg-green-200', 'text-green-800');
            break;
        case 'imported':
            el.textContent = 'Imported! Saving...';
            el.classList.remove('bg-gray-200', 'text-gray-600', 'bg-red-200', 'text-red-800', 'bg-green-200', 'text-green-800');
            el.classList.add('bg-yellow-200', 'text-yellow-800');
            break;
        case 'error':
            el.textContent = 'Error';
            el.classList.remove('bg-gray-200', 'text-gray-600', 'bg-green-200', 'text-green-800', 'bg-yellow-200', 'text-yellow-800');
            el.classList.add('bg-red-200', 'text-red-800');
            break;
        case 'offline':
            el.textContent = 'Offline';
            el.classList.add('bg-gray-200', 'text-gray-600');
            break;
    }
}
window.setSaveStatus = setSaveStatus;

// --- Data Persistence ---
function getProjectDataFromDOM() {
    const scriptContent = document.getElementById('script-editor').innerHTML;

    const storyboardPanels = [];
    document.querySelectorAll('#storyboard-grid .storyboard-panel').forEach((panel, index) => {
        const img = panel.querySelector('.sb-image');
        storyboardPanels.push({
            id: panel.dataset.id || crypto.randomUUID(),
            panelNum: index + 1,
            imageDataURL: (img && img.src && img.src.startsWith('data:image')) ? img.src : '',
            notes: panel.querySelector('.sb-notes').value
        });
    });

    const shotList = [];
    document.querySelectorAll('#shot-list-body .shot-list-row').forEach((row, index) => {
        shotList.push({
            id: row.dataset.id || crypto.randomUUID(),
            shotNum: index + 1,
            sceneNum: row.querySelector('.sl-scene').value,
            shotType: row.querySelector('.sl-type').value,
            description: row.querySelector('.sl-desc').value,
            notes: row.querySelector('.sl-notes').value
        });
    });

    return { scriptContent, storyboardPanels, shotList };
}

function renderProjectDataToDOM(data) {
    const editor = document.getElementById('script-editor');
    if (data.scriptContent) {
        editor.innerHTML = data.scriptContent;
    } else {
        editor.innerHTML = '<div class="script-scene-heading">SCENE 1</div><div class="script-action"></div>';
    }

    renderStoryboards(data.storyboardPanels || []);
    renderShotlist(data.shotList || []);
}

async function saveProjectData() {
    setSaveStatus('saving');
    try {
        const projectData = getProjectDataFromDOM();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectData));
        setSaveStatus('saved');
    } catch (error) {
        console.error("Error saving project data to local storage: ", error);
        setSaveStatus('error');
    }
}
window.saveProjectData = saveProjectData;

async function loadProjectData() {
    try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            renderProjectDataToDOM(data);
        } else {
            console.log("No local data found! Creating a new project.");
            const defaultData = {
                 scriptContent: '<div class="script-scene-heading">INT. NEW PROJECT - DAY</div><div class="script-action">Start writing here...</div>',
                 storyboardPanels: [],
                 shotList: []
            };
            renderProjectDataToDOM(defaultData);
            await saveProjectData();
        }
        setSaveStatus('saved');
    } catch (error) {
        console.error("Error loading project data from local storage: ", error);
        setSaveStatus('error');
    }
}

function initializeApp() {
    loadProjectData();
    attachAppListeners();
}

window.debouncedSave = () => {
    setSaveStatus('saving');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveProjectData, 1500);
};

// --- Render Helpers ---
function renderStoryboards(panels) {
    const grid = document.getElementById('storyboard-grid');
    grid.innerHTML = '';
    panels.forEach(panelData => {
        const panel = document.createElement('div');
        panel.className = 'bg-white rounded-lg shadow-md overflow-hidden storyboard-panel';
        panel.dataset.id = panelData.id || crypto.randomUUID();
        panel.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">Panel ${panelData.panelNum}</h3>
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
                    <textarea class="sb-notes w-full h-24 p-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Add notes...">${panelData.notes || ''}</textarea>
                </div>
            </div>`;
        grid.appendChild(panel);

        if (panelData.imageDataURL) {
            const container = panel.querySelector('.sb-image-container');
            container.classList.add('has-image');
            panel.querySelector('.sb-image').src = panelData.imageDataURL;
        }
    });
}
window.renderStoryboards = renderStoryboards;

function renderShotlist(shots) {
    const body = document.getElementById('shot-list-body');
    body.innerHTML = '';
    shots.forEach(shotData => {
        const row = document.createElement('tr');
        row.className = 'shot-list-row';
        row.dataset.id = shotData.id || crypto.randomUUID();
        row.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap"><span class="text-sm font-medium text-gray-900 shot-number">${shotData.shotNum}</span></td>
            <td class="px-4 py-3"><input type="text" class="sl-scene w-20 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="1A" value="${shotData.sceneNum || ''}"></td>
            <td class="px-4 py-3"><input type="text" class="sl-type w-28 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., MCU, WS" value="${shotData.shotType || ''}"></td>
            <td class="px-4 py-3"><textarea class="sl-desc w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Shot description...">${shotData.description || ''}</textarea></td>
            <td class="px-4 py-3"><textarea class="sl-notes w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Lens, gear, etc...">${shotData.notes || ''}</textarea></td>
            <td class="px-4 py-3 text-center">
                <button class="delete-shot text-gray-400 hover:text-red-500" title="Delete shot">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
            </td>`;
        body.appendChild(row);
    });
}
window.renderShotlist = renderShotlist;

// --- Import / Export ---
function exportProject() {
    const data = getProjectDataFromDOM();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'production-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importProject() {
    const fileInput = document.getElementById('import-file-input');
    fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data && data.scriptContent !== undefined) {
                    renderProjectDataToDOM(data);
                    setSaveStatus('imported');
                    saveProjectData();
                } else {
                    throw new Error("Invalid project file format.");
                }
            } catch (err) {
                console.error("Error importing file:", err);
                setSaveStatus('error');
            } finally {
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    };
}
window.importProject = importProject;
window.exportProject = exportProject;

// --- UI & Editor logic ---
const sections = ['script', 'storyboard', 'shotlist'];
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

function showSection(sectionId) {
    sections.forEach(id => {
        const isTarget = id === sectionId;
        sectionElements[id]().classList.toggle('hidden', !isTarget);
        navButtons[id]().classList.toggle('nav-button-active', isTarget);
        navButtons[id]().classList.toggle('nav-button-inactive', !isTarget);
    });
}
window.showSection = showSection;

const elementTypes = ['script-action', 'script-character', 'script-parenthetical', 'script-transition', 'script-scene-heading'];

function getSelectionParent() {
    let parent = window.getSelection().anchorNode;
    if (!parent) return null;
    if (parent.nodeType != Node.ELEMENT_NODE) parent = parent.parentNode;
    while (parent && parent.parentNode && parent.parentNode.id !== 'script-editor') parent = parent.parentNode;
    return (parent && parent.parentNode && parent.parentNode.id === 'script-editor') ? parent : null;
}

function setSelection(el) {
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

function handleScriptKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const currentEl = getSelectionParent();
        let nextClass = 'script-action';
        if (currentEl) {
            const currentClass = currentEl.className;
            if (currentClass.includes('script-scene-heading')) nextClass = 'script-action';
            if (currentClass.includes('script-action')) nextClass = 'script-action';
            if (currentClass.includes('script-character')) nextClass = 'script-dialog';
            if (currentClass.includes('script-dialog')) nextClass = 'script-character';
            if (currentClass.includes('script-parenthetical')) nextClass = 'script-dialog';
            if (currentClass.includes('script-transition')) nextClass = 'script-scene-heading';
        }
        const newEl = document.createElement('div');
        newEl.className = nextClass;
        if (currentEl) currentEl.after(newEl); else document.getElementById('script-editor').appendChild(newEl);
        setSelection(newEl);
        window.debouncedSave();
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        const currentEl = getSelectionParent();
        if (currentEl && currentEl.textContent.trim() === '') {
            const currentClass = currentEl.className;
            let currentIndex = elementTypes.indexOf(currentClass);
            if (currentIndex === -1) currentIndex = 0;
            const nextIndex = (currentIndex + 1) % elementTypes.length;
            currentEl.className = elementTypes[nextIndex];
            window.debouncedSave();
        }
    }
}

function changeCurrentElementType(newType) {
    const currentEl = getSelectionParent();
    if (currentEl) {
        currentEl.className = newType;
        setSelection(currentEl);
        window.debouncedSave();
    } else {
        const newEl = document.createElement('div');
        newEl.className = newType;
        document.getElementById('script-editor').appendChild(newEl);
        setSelection(newEl);
        window.debouncedSave();
    }
}
window.changeCurrentElementType = changeCurrentElementType;

// --- Attach listeners after data load ---
function attachAppListeners() {
    const scriptEditor = document.getElementById('script-editor');
    scriptEditor.addEventListener('keydown', handleScriptKeydown);
    scriptEditor.addEventListener('input', window.debouncedSave);

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
        window.debouncedSave();
    });

    document.getElementById('add-shot').addEventListener('click', () => {
        const body = document.getElementById('shot-list-body');
        const shotCount = body.children.length + 1;
        const row = document.createElement('tr');
        row.className = 'shot-list-row';
        row.dataset.id = crypto.randomUUID();
        row.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap"><span class="text-sm font-medium text-gray-900 shot-number">${shotCount}</span></td>
            <td class="px-4 py-3"><input type="text" class="sl-scene w-20 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="1A"></td>
            <td class="px-4 py-3"><input type="text" class="sl-type w-28 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., MCU, WS"></td>
            <td class="px-4 py-3"><textarea class="sl-desc w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Shot description..."></textarea></td>
            <td class="px-4 py-3"><textarea class="sl-notes w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Lens, gear, etc..."></textarea></td>
            <td class="px-4 py-3 text-center">
                <button class="delete-shot text-gray-400 hover:text-red-500" title="Delete shot">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
            </td>`;
        body.appendChild(row);
        window.debouncedSave();
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
                    window.debouncedSave();
                };
                // Use readAsDataURL for images (fix)
                reader.readAsDataURL(file);
            } else {
                window.debouncedSave();
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
            window.debouncedSave();
        }

        const deleteShotButton = e.target.closest('.delete-shot');
        if (deleteShotButton) {
            deleteShotButton.closest('.shot-list-row').remove();
            document.querySelectorAll('#shot-list-body .shot-list-row').forEach((row, index) => {
                row.querySelector('.shot-number').textContent = index + 1;
            });
            window.debouncedSave();
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
            window.debouncedSave();
        }
    });

    document.getElementById('import-button').addEventListener('click', window.importProject);
    document.getElementById('export-button').addEventListener('click', window.exportProject);
}

// Start the app
initializeApp();
