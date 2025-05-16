document.addEventListener('DOMContentLoaded', function () {
    const codeInput = document.getElementById('code-input');
    const graphContainer = document.getElementById('graph-container');
    const notationRadios = document.getElementsByName('notation');
    const templateSelect = document.getElementById('template-select');
    const downloadBtn = document.getElementById('download-btn');
    const downloadFormatSelect = document.getElementById('download-format-select');

    // Panel toggle elements
    const toggleAllPanelsBtn = document.getElementById('toggle-all-panels-btn');
    const settingsPanel = document.querySelector('.settings-panel');
    const codePanel = document.querySelector('.code-panel');
    // const panelsWrapper = document.querySelector('.panels-wrapper'); // If needed

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
        graphContainer.innerHTML = ''; // Clear previous before showing "rendering..."

        if (!code) {
            graphContainer.innerHTML = '<p>コードを入力してください。</p>';
            return;
        }
        graphContainer.innerHTML = `<p>描画中 (${currentNotation === 'dot' ? 'DOT' : 'Mermaid'})...</p>`;

        if (currentNotation === 'dot') {
            if (!vizInstance && !initializeViz()) return; // Initialize if not already, and exit if fails
            if (!vizInstance) { // Double check
                graphContainer.innerHTML = '<p class="error-message">Viz.jsが初期化されていません。</p>'; return;
            }
            try {
                const element = await vizInstance.renderSVGElement(code);
                graphContainer.innerHTML = ''; graphContainer.appendChild(element);
            } catch (error) {
                console.error('Viz.js Error:', error);
                graphContainer.innerHTML = `<p class="error-message">DOTグラフ描画失敗:<br>${error.message || error}</p>`;
                // vizInstance = null; // Consider re-init strategy
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

    // --- Template Handling ---
    async function loadTemplatesAndSetup() {
        try {
            const response = await fetch('templates.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allTemplates = await response.json();

            populateTemplateSelect();
            setupEventListeners();

            // Initial setup based on loaded templates and default selections
            const currentNotation = getSelectedNotation();
            if (currentNotation === 'dot') initializeViz();
            else if (typeof mermaid === 'undefined' && currentNotation === 'mermaid') {
                graphContainer.innerHTML = '<p class="error-message">Mermaid.js未ロード</p>';
            }

            if (allTemplates.length > 0) {
                updateCodeFromTemplate(templateSelect.value || allTemplates[0].id);
            } else {
                graphContainer.innerHTML = codeInput.value.trim() ? '<p>描画試行中...</p>' : '<p>テンプレート無し。コード直接入力可。</p>';
                if(codeInput.value.trim()) renderGraph();
            }
        } catch (error) {
            console.error("テンプレート読込失敗:", error);
            graphContainer.innerHTML = `<p class="error-message">テンプレートファイル読込失敗:<br>${error.message}</p>`;
        }
    }

    function populateTemplateSelect() {
        if (!templateSelect) return;
        templateSelect.innerHTML = '';
        allTemplates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id; option.textContent = template.name;
            templateSelect.appendChild(option);
        });
        if(allTemplates.length > 0) templateSelect.value = allTemplates[0].id; // Default to first template
    }

    function updateCodeFromTemplate(selectedTemplateId) {
        const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);
        if (selectedTemplate) {
            document.getElementById(`radio-${selectedTemplate.notation}`).checked = true;
            codeInput.value = selectedTemplate.code;
        } else if (allTemplates.length > 0 && !selectedTemplateId) { // Fallback if ID is somehow invalid
            const firstTemplate = allTemplates[0];
            document.getElementById(`radio-${firstTemplate.notation}`).checked = true;
            codeInput.value = firstTemplate.code;
            templateSelect.value = firstTemplate.id;
        }
        renderGraph();
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        notationRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const firstValidTemplate = allTemplates.find(t => t.notation === radio.value) || allTemplates[0];
                if (firstValidTemplate) {
                    templateSelect.value = firstValidTemplate.id;
                    updateCodeFromTemplate(firstValidTemplate.id);
                }
            });
        });

        templateSelect.addEventListener('change', function () { updateCodeFromTemplate(this.value); });

        let debounceTimer;
        codeInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderGraph, 500);
        });

        // New All Panels Toggle Button
        if (toggleAllPanelsBtn && settingsPanel && codePanel) {
            toggleAllPanelsBtn.addEventListener('click', function() {
                // Check if *either* panel is currently hidden. If so, action is to show both.
                // Otherwise, action is to hide both.
                const SPHidden = settingsPanel.classList.contains('hidden');
                const CPHidden = codePanel.classList.contains('hidden');

                if (SPHidden || CPHidden) { // If at least one is hidden, show both
                    settingsPanel.classList.remove('hidden');
                    codePanel.classList.remove('hidden');
                    this.textContent = 'すべて隠す';
                    this.title = 'パネルを隠す';
                } else { // Both are visible, hide both
                    settingsPanel.classList.add('hidden');
                    codePanel.classList.add('hidden');
                    this.textContent = 'すべて表示';
                    this.title = 'パネルを表示';
                }
            });
            // Set initial button state based on panels' default visibility
            // Assuming panels are visible by default (no 'hidden' class in HTML)
            const arePanelsInitiallyHidden = settingsPanel.classList.contains('hidden') && codePanel.classList.contains('hidden');
            if (arePanelsInitiallyHidden) {
                toggleAllPanelsBtn.textContent = 'すべて表示';
                toggleAllPanelsBtn.title = 'パネルを表示';
            } else {
                toggleAllPanelsBtn.textContent = 'すべて隠す';
                toggleAllPanelsBtn.title = 'パネルを隠す';
            }

        } else {
            console.warn("Toggle all panels button or target panels not found.");
        }

        // Download functionality
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

    // --- Start Application ---
    loadTemplatesAndSetup();
});