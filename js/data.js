// js/data.js
import { state, setSaveStatus } from './state.js';
import { renderProjectDataToDOM } from './render.js';
import { pushState } from './history.js';

export function getProjectDataFromDOM() {
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

export function renderProjectDataToDOM(data) {
    const editor = document.getElementById('script-editor');
    if (data.scriptContent) {
        editor.innerHTML = data.scriptContent;
    } else {
        editor.innerHTML = '<div class="script-scene-heading">SCENE 1</div><div class="script-action"></div>';
    }

    renderStoryboards(data.storyboardPanels || []);
    renderShotlist(data.shotList || []);
}

export async function saveProjectData() {
    if (state.isRestoring) {
        state.isRestoring = false; // Reset flag after restoration is complete
        return;
    }
    setSaveStatus('saving');
    try {
        const projectData = getProjectDataFromDOM();
        localStorage.setItem(state.LOCAL_STORAGE_KEY, JSON.stringify(projectData));
        setSaveStatus('saved');
        pushState(); // Push state after a successful save
    } catch (error) {
        console.error("Error saving project data to local storage: ", error);
        setSaveStatus('error');
    }
}

export async function loadProjectData() {
    try {
        const savedData = localStorage.getItem(state.LOCAL_STORAGE_KEY);
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

export function debouncedSave() {
    setSaveStatus('saving');
    clearTimeout(state.saveTimeout);
    state.saveTimeout = setTimeout(saveProjectData, 1500);
};

export function exportProject() {
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

export function exportScriptAsTxt() {
    const editor = document.getElementById('script-editor');
    let scriptText = '';

    editor.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node;
            let lineText = el.textContent.trim();
            const type = el.className;

            if (!lineText) {
                scriptText += '\n';
                return;
            }

            if (type.includes('script-scene-heading')) {
                scriptText += lineText.toUpperCase() + '\n\n';
            } else if (type.includes('script-action')) {
                scriptText += lineText + '\n\n';
            } else if (type.includes('script-character')) {
                scriptText += ' '.repeat(30) + lineText.toUpperCase() + '\n';
            } else if (type.includes('script-dialog')) {
                scriptText += ' '.repeat(15) + lineText + '\n\n';
            } else if (type.includes('script-parenthetical')) {
                scriptText += ' '.repeat(22) + `(${lineText})` + '\n';
            } else if (type.includes('script-transition')) {
                scriptText += ' '.repeat(50) + lineText.toUpperCase() + '\n\n';
            } else {
                scriptText += lineText + '\n';
            }
        }
    });

    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importProject() {
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
                    saveProjectData(); // This will also push the new state to history
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
