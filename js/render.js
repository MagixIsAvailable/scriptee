// js/render.js
import { debouncedSave } from './data.js';

export function renderStoryboards(panels) {
    const grid = document.getElementById('storyboard-grid');
    grid.innerHTML = '';
    panels.forEach(panelData => {
        const panel = document.createElement('div');
        panel.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden storyboard-panel flex';
        panel.dataset.id = panelData.id || crypto.randomUUID();
        panel.innerHTML = `
            <div class="sb-drag-handle cursor-move bg-gray-100 dark:bg-gray-700 p-2 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
            <div class="p-4 flex-grow">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Panel ${panelData.panelNum}</h3>
                    <button class="delete-panel text-gray-400 hover:text-red-500" title="Delete panel">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
                <div class="sb-image-container aspect-video bg-gray-100 dark:bg-gray-900 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-3 relative overflow-hidden">
                    <img src="" class="sb-image w-full h-full object-cover" alt="Storyboard Image">
                    <div class="sb-image-placeholder text-gray-500 dark:text-gray-400 text-sm p-4 text-center">Click, paste, or drag image here</div>
                    <button class="sb-remove-image absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold" title="Remove image">&times;</button>
                    <input type="file" class="sb-image-input hidden" accept="image/*">
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Dialogue</label>
                    <textarea class="sb-notes w-full h-24 p-2 mt-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Add notes...">${panelData.notes || ''}</textarea>
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

export function renderShotlist(shots) {
    const body = document.getElementById('shot-list-body');
    body.innerHTML = '';
    shots.forEach(shotData => {
        const row = document.createElement('tr');
        row.className = 'shot-list-row';
        row.dataset.id = shotData.id || crypto.randomUUID();
        row.innerHTML = `
            <td data-label="Shot #" class="px-4 py-3 whitespace-nowrap"><span class="text-sm font-medium text-gray-900 shot-number">${shotData.shotNum}</span></td>
            <td data-label="Scene #" class="px-4 py-3"><input type="text" class="sl-scene w-20 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="1A" value="${shotData.sceneNum || ''}"></td>
            <td data-label="Shot Type" class="px-4 py-3"><input type="text" class="sl-type w-28 p-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., MCU, WS" value="${shotData.shotType || ''}"></td>
            <td data-label="Description" class="px-4 py-3"><textarea class="sl-desc w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Shot description...">${shotData.description || ''}</textarea></td>
            <td data-label="Notes" class="px-4 py-3"><textarea class="sl-notes w-full h-12 p-1 border border-gray-300 rounded-md shadow-sm text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Lens, gear, etc...">${shotData.notes || ''}</textarea></td>
            <td data-label="Actions" class="px-4 py-3 text-center">
                <button class="delete-shot text-gray-400 hover:text-red-500" title="Delete shot">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
            </td>`;
        body.appendChild(row);
    });
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
