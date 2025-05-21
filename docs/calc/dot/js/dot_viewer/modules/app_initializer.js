// js/dot_viewer/modules/app_initializer.js
import {
    templateSelect, codeInput, notationRadios, toggleAllPanelsBtn, settingsPanel,
    codePanel, toggleFullscreenBtn, bodyElement, clearCodeBtn, copyCodeBtn, pasteCodeBtn, // Added pasteCodeBtn
    graphContainer
} from './dom_elements.js';
import * as state from './state.js';
import { initializeVizInstance, initializeMermaid, renderGraph } from './graph_renderer.js';
import { getSelectedNotation } from './graph_utils.js';
import { setupCoreEventListeners } from './event_handlers.js';

import { loadTemplatesFromFile, populateTemplateSelectWithOptions, applyTemplateToUI } from './template_manager.js';
import {
    setupAllPanelsToggle, setupFullscreenToggle, setupClearCodeButton,
    setupCopyCodeButton, setupPasteCodeButton // Added setupPasteCodeButton
} from './ui_interactions.js';


export async function initializeApp() {
    try {
        const templates = await loadTemplatesFromFile('js/dot_viewer/templates.json');
        state.setAllTemplates(templates);
        populateTemplateSelectWithOptions(templateSelect, state.allTemplates);

        if (toggleAllPanelsBtn && settingsPanel && codePanel) setupAllPanelsToggle(toggleAllPanelsBtn, settingsPanel, codePanel);
        if (toggleFullscreenBtn && bodyElement) setupFullscreenToggle(toggleFullscreenBtn, bodyElement);

        // Code action buttons
        if (clearCodeBtn && codeInput) setupClearCodeButton(clearCodeBtn, codeInput, renderGraph);
        if (copyCodeBtn && codeInput) setupCopyCodeButton(copyCodeBtn, codeInput);
        if (pasteCodeBtn && codeInput) setupPasteCodeButton(pasteCodeBtn, codeInput, renderGraph); // Added

        setupCoreEventListeners();

        if (state.allTemplates.length > 0 && templateSelect.value) {
            applyTemplateToUI(templateSelect.value, state.allTemplates, codeInput, notationRadios);
        }

        initializeMermaid();
        if (getSelectedNotation() === 'dot') {
            initializeVizInstance();
        }

        if (codeInput.value.trim()) {
            await renderGraph();
        } else if (state.allTemplates.length === 0) {
            graphContainer.innerHTML = '<p>テンプレート無し。コードを直接入力してください。</p>';
        } else {
            graphContainer.innerHTML = '<p>記法を選択し、有効なコードを入力するか、テンプレートを選択してください。</p>';
        }

    } catch (error) {
        console.error("アプリケーション初期化失敗:", error);
        if (graphContainer) {
            graphContainer.innerHTML = `<p class="error-message">アプリケーションの初期化に失敗しました。<br>${error.message || '詳細不明'}</p>`;
        }
    }
}