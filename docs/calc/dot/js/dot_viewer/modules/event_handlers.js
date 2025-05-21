// js/dot_viewer/modules/event_handlers.js
import {
    notationRadios, templateSelect, codeInput, downloadBtn,
    downloadFormatSelect, graphContainer
} from './dom_elements.js';
import * as state from './state.js';
import { applyTemplateToUI } from './template_manager.js'; // Updated import
import { renderGraph } from './graph_renderer.js';
import { downloadSVG, downloadPNG, triggerDownload } from './download_utils.js'; // Updated import

export function handleNotationChange(event) {
    const selectedNotation = event.target.value;
    const firstMatchingTemplate = state.allTemplates.find(t => t.notation === selectedNotation);
    let templateToApplyId = null;

    if (firstMatchingTemplate) {
        templateToApplyId = firstMatchingTemplate.id;
    } else if (state.allTemplates.length > 0) {
        templateToApplyId = state.allTemplates[0].id;
    }

    if (templateToApplyId) {
        templateSelect.value = templateToApplyId;
        applyTemplateToUI(templateToApplyId, state.allTemplates, codeInput, notationRadios);
    }
    renderGraph(); // renderGraph itself handles current codeInput value
}

export function handleTemplateChange(event) {
    applyTemplateToUI(event.target.value, state.allTemplates, codeInput, notationRadios);
    renderGraph();
}

let debounceTimer;
export function handleCodeInputChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderGraph, 500);
}

export function handleDownload() {
    const format = downloadFormatSelect.value.toLowerCase();
    const svgElement = graphContainer.querySelector('svg');

    if (svgElement) {
        if (format === 'svg') downloadSVG(svgElement); // graphContainer no longer strictly needed
        else if (format === 'png') downloadPNG(svgElement); // graphContainer no longer strictly needed
        else alert('不明なグラフィックダウンロード形式です: ' + format);
    } else {
        const currentText = graphContainer.textContent || graphContainer.innerText;
        if (currentText && currentText.trim() !== '') {
            const blob = new Blob([currentText.trim()], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            triggerDownload(url, 'graph_content.txt');
        } else {
            alert('ダウンロード可能なコンテンツが graph container に見つかりません。');
        }
    }
}

export function setupCoreEventListeners() {
    notationRadios.forEach(radio => radio.addEventListener('change', handleNotationChange));
    templateSelect.addEventListener('change', handleTemplateChange);
    codeInput.addEventListener('input', handleCodeInputChange);
    if (downloadBtn) downloadBtn.addEventListener('click', handleDownload);
}