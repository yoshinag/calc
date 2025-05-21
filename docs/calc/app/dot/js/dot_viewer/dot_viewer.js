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

    // State Variables
    let vizInstance;
    let allTemplates = []; // This will store templates loaded by template_manager.js

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
        graphContainer.innerHTML = '';

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
                graphContainer.innerHTML = ''; graphContainer.appendChild(element);
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
                const { svg, bindFunctions } = await mermaid.render(uniqueId, code);
                graphContainer.innerHTML = svg;
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
                    templateToApplyId = allTemplates[0].id;
                }

                if (templateToApplyId) {
                    templateSelect.value = templateToApplyId;
                    if (typeof applyTemplateToUI === 'function') { // From template_manager.js
                        applyTemplateToUI(templateToApplyId, allTemplates, codeInput, notationRadios);
                        renderGraph();
                    } else {
                        console.error("applyTemplateToUI is not defined. Check template_manager.js");
                    }
                }
            });
        });

        templateSelect.addEventListener('change', function () {
            if (typeof applyTemplateToUI === 'function') { // From template_manager.js
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

        // Download functionality (relies on download_utils.js)
        if (downloadBtn && downloadFormatSelect) {
            downloadBtn.addEventListener('click', () => {
                const format = downloadFormatSelect.value.toLowerCase();
                const svgElement = graphContainer.querySelector('svg');
                if (!svgElement || graphContainer.querySelector('p')) {
                    alert('DL可能なグラフ未描画'); return;
                }
                if (typeof downloadSVG !== 'function' || typeof downloadPNG !== 'function') {
                    alert('ダウンロード関数未定義(download_utils.js確認)'); return;
                }

                if (format === 'svg') downloadSVG(svgElement, graphContainer);
                else if (format === 'png') downloadPNG(svgElement, graphContainer);
                else alert('不明なDL形式: ' + format);
            });
        }
    }

    // --- Application Initialization ---
    async function initializeApp() {
        try {
            // Fetch templates using template_manager.js
            if (typeof loadTemplatesFromFile === 'function') { // From template_manager.js
                allTemplates = await loadTemplatesFromFile('js/dot_viewer/templates.json');
            } else {
                console.error("loadTemplatesFromFile function is not defined. Check template_manager.js.");
                throw new Error("Template loading function missing.");
            }

            // Populate UI elements that depend on templates using template_manager.js
            if (typeof populateTemplateSelectWithOptions === 'function') { // From template_manager.js
                populateTemplateSelectWithOptions(templateSelect, allTemplates);
            } else {
                console.error("populateTemplateSelectWithOptions function is not defined. Check template_manager.js.");
            }

            // Initialize UI interactions (e.g., panel toggles from ui_interactions.js)
            if (typeof setupAllPanelsToggle === 'function') { // From ui_interactions.js
                setupAllPanelsToggle(toggleAllPanelsBtn, settingsPanel, codePanel);
            } else {
                console.error("setupAllPanelsToggle function is not defined. Check ui_interactions.js.");
            }

            // Setup other event listeners
            setupEventListeners();

            // Initial graph rendering logic
            // Apply the initially selected template first to set notation and code
            if (allTemplates.length > 0) {
                if (typeof applyTemplateToUI === 'function') { // From template_manager.js
                    applyTemplateToUI(templateSelect.value, allTemplates, codeInput, notationRadios);
                } else {
                    console.error("applyTemplateToUI is not defined. Check template_manager.js");
                }
            }

            // Now get the notation (which might have been set by applyTemplateToUI)
            const currentNotation = getSelectedNotation();
            if (currentNotation === 'dot') {
                initializeViz();
            } else if (typeof mermaid === 'undefined' && currentNotation === 'mermaid') {
                graphContainer.innerHTML = '<p class="error-message">Mermaid.js未ロード</p>';
            }

            // Render the initial graph based on the (possibly template-applied) code
            if (allTemplates.length > 0 || codeInput.value.trim()) {
                renderGraph();
            } else {
                graphContainer.innerHTML = '<p>テンプレート無し。コード直接入力可。</p>';
            }

        } catch (error) {
            console.error("アプリケーション初期化失敗:", error);
            graphContainer.innerHTML = `<p class="error-message">アプリケーションの初期化に失敗しました。<br>${error.message || '詳細不明'}</p>`;
        }
    }

    // --- Start Application ---
    initializeApp();
});