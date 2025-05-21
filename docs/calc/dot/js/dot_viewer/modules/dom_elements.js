// js/dot_viewer/modules/dom_elements.js
export const codeInput = document.getElementById('code-input');
export const graphContainer = document.getElementById('graph-container');
export const notationRadios = document.getElementsByName('notation');
export const templateSelect = document.getElementById('template-select');
export const downloadBtn = document.getElementById('download-btn');
export const downloadFormatSelect = document.getElementById('download-format-select');
export const toggleAllPanelsBtn = document.getElementById('toggle-all-panels-btn');
export const settingsPanel = document.querySelector('.settings-panel');
export const codePanel = document.querySelector('.code-panel');
export const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
export const bodyElement = document.body;
export const clearCodeBtn = document.getElementById('clear-code-btn');
export const copyCodeBtn = document.getElementById('copy-code-btn');
export const pasteCodeBtn = document.getElementById('paste-code-btn'); // Added
export const outputPanel = document.querySelector('.output-panel');

if (!codeInput || !graphContainer || !templateSelect || !pasteCodeBtn /* Added check */) {
    console.error("One or more critical DOM elements are missing. Application might not work correctly.");
}