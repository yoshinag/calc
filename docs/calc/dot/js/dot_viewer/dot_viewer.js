// dot_viewer.js

document.addEventListener('DOMContentLoaded', function () {
    // DOM Element References
    const codeInput = document.getElementById('code-input');
    const graphContainer = document.getElementById('graph-container');
    const notationRadios = document.getElementsByName('notation');
    const templateSelect = document.getElementById('template-select');
    const downloadBtn = document.getElementById('download-btn');
    const downloadFormatSelect = document.getElementById('download-format-select');

    const toggleAllPanelsBtn = document.getElementById('toggle-all-panels-btn');
    const settingsPanel = document.querySelector('.settings-panel');
    const codePanel = document.querySelector('.code-panel');

    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const bodyElement = document.body;

    // State Variables
    let vizInstance;
    let allTemplates = [];

    // --- Core Initializations (Viz, Mermaid) ---
    function initializeViz() {
        if (typeof Viz === 'undefined') {
            console.error("Viz.js is not loaded.");
            graphContainer.innerHTML = '<p class="error-message">Viz.jsの読み込みに失敗しました。</p>';
            return false;
        }
        try {
            vizInstance = new Viz(); return true;
        } catch (e) {
            console.error("Viz.js の初期化に失敗:", e);
            graphContainer.innerHTML = '<p class="error-message">Viz.js の初期化に失敗しました。</p>';
            vizInstance = null; return false;
        }
    }

    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
    } else {
        console.warn("Mermaid.js is not loaded.");
    }

    // --- Utility Functions ---
    function getSelectedNotation() {
        for (const radio of notationRadios) { if (radio.checked) return radio.value; }
        return null;
    }

    // --- Rendering Logic ---
    async function renderGraph() {
        const currentNotation = getSelectedNotation();
        const code = codeInput.value.trim();
        graphContainer.innerHTML = ''; // Clear previous content

        if (!code) {
            graphContainer.innerHTML = '<p>コードを入力してください。</p>';
            return;
        }
        graphContainer.innerHTML = `<p>描画中 (${currentNotation === 'dot' ? 'DOT' : 'Mermaid'})...</p>`;

        if (currentNotation === 'dot') {
            if (!vizInstance && !initializeViz()) return;
            if (!vizInstance) {
                graphContainer.innerHTML = '<p class="error-message">Viz.jsが初期化されていません。</p>'; return;
            }
            try {
                const element = await vizInstance.renderSVGElement(code);
                graphContainer.innerHTML = '';
                graphContainer.appendChild(element);
            } catch (error) {
                console.error('Viz.js Error:', error);
                graphContainer.innerHTML = `<p class="error-message">DOTグラフ描画失敗:<br>${error.message || error}</p>`;
            }
        } else if (currentNotation === 'mermaid') {
            if (typeof mermaid === 'undefined') {
                graphContainer.innerHTML = '<p class="error-message">Mermaid.js未ロード</p>'; return;
            }
            try {
                const uniqueId = 'mermaid-graph-' + Date.now();
                // Ensure the container is clean before mermaid tries to render,
                // especially if there was a "描画中..." message.
                graphContainer.innerHTML = '';
                const { svg, bindFunctions } = await mermaid.render(uniqueId, code);
                graphContainer.innerHTML = svg; // Mermaid replaces the content if it finds the ID, but clear first to be safe.
                if (bindFunctions) bindFunctions(graphContainer);
            } catch (error) {
                console.error('Mermaid.js Error:', error);
                let errMsg = error.message || error.str || (typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error));
                graphContainer.innerHTML = `<p class="error-message">Mermaidグラフ描画失敗:<br>${errMsg}</p>`;
            }
        } else {
            graphContainer.innerHTML = '<p>対応記法未選択</p>';
        }
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        notationRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const firstMatchingTemplate = allTemplates.find(t => t.notation === radio.value);
                let templateToApplyId = null;

                if (firstMatchingTemplate) {
                    templateToApplyId = firstMatchingTemplate.id;
                } else if (allTemplates.length > 0) {
                    templateToApplyId = allTemplates[0].id; // Fallback to first template if no match for notation
                }

                if (templateToApplyId) {
                    templateSelect.value = templateToApplyId;
                    if (typeof applyTemplateToUI === 'function') {
                        applyTemplateToUI(templateToApplyId, allTemplates, codeInput, notationRadios);
                        renderGraph();
                    } else {
                        console.error("applyTemplateToUI is not defined. Check template_manager.js");
                    }
                } else {
                    // If no template matches and no fallback, clear code or keep existing, then render
                    // For now, we assume applyTemplateToUI handles this or we simply re-render
                    renderGraph();
                }
            });
        });

        templateSelect.addEventListener('change', function () {
            if (typeof applyTemplateToUI === 'function') {
                applyTemplateToUI(this.value, allTemplates, codeInput, notationRadios);
                renderGraph();
            } else {
                console.error("applyTemplateToUI is not defined. Check template_manager.js");
            }
        });

        let debounceTimer;
        codeInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderGraph, 500);
        });

        if (downloadBtn && downloadFormatSelect) {
            downloadBtn.addEventListener('click', () => {
                const format = downloadFormatSelect.value.toLowerCase();
                const svgElement = graphContainer.querySelector('svg');

                if (svgElement) { // SVGグラフが存在する場合
                    if (typeof downloadSVG !== 'function' || typeof downloadPNG !== 'function') {
                        alert('ダウンロード関数が定義されていません。(download_utils.jsを確認してください)');
                        return;
                    }
                    if (format === 'svg') {
                        downloadSVG(svgElement, graphContainer);
                    } else if (format === 'png') {
                        downloadPNG(svgElement, graphContainer);
                    } else {
                        alert('不明なグラフィックダウンロード形式です: ' + format);
                    }
                } else { // SVGグラフが存在しない場合 (エラーメッセージやプレースホルダなど)
                    const currentText = graphContainer.textContent || graphContainer.innerText;
                    if (currentText && currentText.trim() !== '') {
                        if (typeof triggerDownload === 'function') { // from download_utils.js
                            const blob = new Blob([currentText.trim()], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            triggerDownload(url, 'graph_content.txt');
                            // URL.revokeObjectURL(url) is handled inside triggerDownload for blobs
                        } else {
                            alert('テキストダウンロード用の triggerDownload 関数が定義されていません。(download_utils.jsを確認してください)');
                        }
                    } else {
                        alert('ダウンロード可能なコンテンツが graph container に見つかりません。');
                    }
                }
            });
        }
    }

    // --- Application Initialization ---
    async function initializeApp() {
        try {
            if (typeof loadTemplatesFromFile === 'function') {
                allTemplates = await loadTemplatesFromFile('js/dot_viewer/templates.json');
            } else {
                console.error("loadTemplatesFromFile function is not defined. Check template_manager.js.");
                throw new Error("Template loading function missing.");
            }

            if (typeof populateTemplateSelectWithOptions === 'function') {
                populateTemplateSelectWithOptions(templateSelect, allTemplates);
            } else {
                console.error("populateTemplateSelectWithOptions function is not defined. Check template_manager.js.");
            }

            if (typeof setupAllPanelsToggle === 'function') {
                setupAllPanelsToggle(toggleAllPanelsBtn, settingsPanel, codePanel);
            } else {
                console.error("setupAllPanelsToggle function is not defined. Check ui_interactions.js.");
            }

            // Initialize Fullscreen toggle for the graph view
            if (typeof setupFullscreenToggle === 'function') {
                if (toggleFullscreenBtn && bodyElement) {
                    setupFullscreenToggle(toggleFullscreenBtn, bodyElement);
                } else {
                    console.error("Elements for fullscreen toggle (button or body) not found in DOM.");
                }
            } else {
                console.error("setupFullscreenToggle function is not defined. Check ui_interactions.js.");
            }

            setupEventListeners();

            if (allTemplates.length > 0) {
                if (typeof applyTemplateToUI === 'function') {
                    // Apply the template associated with the initially selected <select> option
                    applyTemplateToUI(templateSelect.value, allTemplates, codeInput, notationRadios);
                } else {
                    console.error("applyTemplateToUI is not defined. Check template_manager.js");
                }
            }

            const currentNotation = getSelectedNotation();
            if (currentNotation === 'dot') {
                initializeViz();
            } // Mermaid is initialized at the start if present

            // Initial render based on template or existing code
            if (codeInput.value.trim()) { // Check if codeInput has content after potential template application
                renderGraph();
            } else if (allTemplates.length === 0) { // No templates, no code
                graphContainer.innerHTML = '<p>テンプレート無し。コードを直接入力してください。</p>';
            } else { // Templates exist, but selected one might be empty or user cleared input
                graphContainer.innerHTML = '<p>記法を選択し、有効なコードを入力するか、テンプレートを選択してください。</p>';
            }


        } catch (error) {
            console.error("アプリケーション初期化失敗:", error);
            graphContainer.innerHTML = `<p class="error-message">アプリケーションの初期化に失敗しました。<br>${error.message || '詳細不明'}</p>`;
        }
    }

    // --- Start Application ---
    initializeApp();
});