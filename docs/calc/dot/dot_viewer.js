// dot_viewer.js

// DOM要素の取得は window.onload 内で行う
let codeInput, graphOutput, notationRadios, templateSelect, downloadBtn,
    downloadFormatSelect, editorPane, previewPane, splitter, contentArea,
    controlsPanel, toggleControlsBtn;

// アプリケーションの状態変数
let vizInstance = null;
let currentNotation = 'mermaid'; // デフォルト記法
let isVizJsReady = false;
// 'templates' 変数は dot_viewer_templates.js からロードされる

function loadScript(src, integrity, crossOrigin = 'anonymous') {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        if (integrity) script.integrity = integrity;
        if (crossOrigin && integrity) script.crossOrigin = crossOrigin;
        script.async = false; // 順番を重視

        script.onload = () => {
            console.log(`Script loaded: ${src}`);
            resolve();
        };
        script.onerror = (err) => {
            console.error(`Error loading script: ${src}`, err);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

async function loadLibrariesAndInitialize() {
    try {
        // dot_viewer_templates.js はHTMLで先に読み込まれているので、ここでは不要
        // ただし、templates変数が利用可能であるかのチェックは重要
        if (typeof templates === 'undefined') {
            throw new Error("dot_viewer_templates.js was not loaded or 'templates' variable is not defined.");
        }
        console.log("Templates available.");

        await loadScript('viz.js', null, null);
        await loadScript('full.render.js', null, null);
        console.log("Viz.js loaded from local files.");

        await loadScript('https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js', null, null);
        console.log("Mermaid.js loaded.");

        initializeApp();

    } catch (error) {
        console.error("Fatal error during library loading or pre-check:", error);
        if (graphOutput) { // graphOutputが取得できていればエラー表示
            graphOutput.innerHTML = `<div class="error-message">重要ライブラリの読み込みに失敗しました: ${error.message || String(error)}. アプリケーションを開始できません。ページを再読み込みしてください。</div>`;
        }
    }
}

function initializeApp() {
    console.log("Initializing application...");

    if (typeof mermaid !== 'undefined' && mermaid.initialize) {
        try {
            mermaid.initialize({ startOnLoad: false, theme: 'default' });
            console.log("Mermaid.js initialized.");
        } catch (e) {
            console.error("Error initializing Mermaid.js:", e);
            graphOutput.innerHTML = '<div class="error-message">エラー: Mermaid.jsの初期化に失敗しました。</div>';
        }
    } else {
        console.warn("Mermaid.js not found or initialize method missing after dynamic load.");
        graphOutput.innerHTML = '<div class="error-message">警告: Mermaid.jsが正しく読み込まれませんでした。</div>';
    }

    if (typeof Viz !== 'undefined') {
        try {
            vizInstance = new Viz();
            isVizJsReady = true;
            console.log("Viz.js instance created successfully.");
        } catch (e) {
            console.error("Error creating Viz instance:", e);
            isVizJsReady = false;
            graphOutput.innerHTML = `<div class="error-message">エラー: Viz.jsの初期化に失敗しました: ${e.message}. DOTレンダリングは利用できません。</div>`;
        }
    } else {
        console.warn("Viz constructor not found after dynamic load. DOT rendering will not be available.");
        isVizJsReady = false;
        if (currentNotation === 'dot') {
            graphOutput.innerHTML = '<div class="error-message">警告: Viz.jsが読み込まれなかったため、DOTグラフは表示できません。</div>';
        }
    }

    document.getElementById('radio-dot').checked = (currentNotation === 'dot');
    document.getElementById('radio-mermaid').checked = (currentNotation === 'mermaid');

    setInitialPaneHeights();
    updateTemplateOptions();

    codeInput.addEventListener('input', debouncedRenderGraph);
    notationRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentNotation = event.target.value;
            updateTemplateOptions();
        });
    });
    templateSelect.addEventListener('change', (event) => {
        loadTemplate(event.target.value);
    });
    downloadBtn.addEventListener('click', downloadHandler);
    toggleControlsBtn.addEventListener('click', toggleControlsHandler);
    splitter.addEventListener('mousedown', splitterMouseDownHandler);

    window.addEventListener('resize', debounce(setInitialPaneHeights, 200));

    console.log("Application initialized and event listeners attached.");
    if (graphOutput.innerHTML.includes('<p>ライブラリを読み込み中です...</p>')) { // innerHTMLの一致で確認
        graphOutput.innerHTML = 'コードを入力するか、テンプレートを選択してください。';
    }
}

function updateTemplateOptions() {
    if (typeof templates === 'undefined') {
        console.error("Templates not loaded! Cannot update options.");
        templateSelect.innerHTML = '<option value="">テンプレート読込エラー</option>';
        return;
    }
    templateSelect.innerHTML = '';
    let firstTemplateKey = null;
    for (const key in templates) {
        if (templates[key].type === currentNotation) {
            if (!firstTemplateKey) firstTemplateKey = key;
            const option = document.createElement('option');
            option.value = key;
            option.textContent = templates[key].name;
            templateSelect.appendChild(option);
        }
    }
    if (firstTemplateKey) {
        templateSelect.value = firstTemplateKey;
        loadTemplate(firstTemplateKey);
    } else {
        codeInput.value = `// ${currentNotation} のテンプレートがありません。`;
        renderGraph();
    }
}

function loadTemplate(templateKey) {
    if (typeof templates === 'undefined' || !templates[templateKey]) {
        codeInput.value = `// テンプレート "${templateKey}" が見つかりません`;
        renderGraph();
        return;
    }
    codeInput.value = templates[templateKey].code;
    renderGraph();
}

async function renderGraph() {
    const code = codeInput.value.trim();
    graphOutput.innerHTML = '';

    if (!code) {
        graphOutput.innerHTML = 'コードを入力してください。';
        return;
    }

    try {
        if (currentNotation === 'dot') {
            if (!isVizJsReady) {
                throw new Error("Viz.js is not ready. DOT rendering is unavailable.");
            }
            const element = await vizInstance.renderSVGElement(code);
            graphOutput.appendChild(element);
        } else if (currentNotation === 'mermaid') {
            if (typeof mermaid === 'undefined' || !mermaid.render) {
                throw new Error("Mermaid.js is not ready or not loaded.");
            }
            const { svg } = await mermaid.render('mermaid-graph-' + Date.now(), code);
            graphOutput.innerHTML = svg;
        }
    } catch (error) {
        console.error("Rendering error:", error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `レンダリングエラー: ${error.message || String(error)}`;
        graphOutput.appendChild(errorMessage);
    }
}

const debouncedRenderGraph = debounce(renderGraph, 500);

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function downloadHandler() {
    const format = downloadFormatSelect.value;
    const svgElement = graphOutput.querySelector('svg');

    if (!svgElement) {
        alert("描画されたグラフがありません。");
        return;
    }
    const svgString = new XMLSerializer().serializeToString(svgElement);
    if (format === 'svg') {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadFile('graph.svg', url);
        URL.revokeObjectURL(url);
    } else if (format === 'png') {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let svgWidth = svgElement.width.baseVal.value;
            let svgHeight = svgElement.height.baseVal.value;
            if (svgWidth === 0 || svgHeight === 0) {
                const viewBox = svgElement.viewBox.baseVal;
                if (viewBox && viewBox.width && viewBox.height) {
                    svgWidth = viewBox.width;
                    svgHeight = viewBox.height;
                } else {
                    const rect = svgElement.getBoundingClientRect();
                    svgWidth = rect.width || 600;
                    svgHeight = rect.height || 400;
                }
            }
            const scaleFactor = 2;
            canvas.width = svgWidth * scaleFactor;
            canvas.height = svgHeight * scaleFactor;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scaleFactor, scaleFactor);
            ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
            const pngUrl = canvas.toDataURL('image/png');
            downloadFile('graph.png', pngUrl);
            URL.revokeObjectURL(svgUrl);
        };
        img.onerror = (e) => {
            alert("PNGへの変換に失敗しました。");
            console.error("PNG conversion error:", e);
            URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;
    }
}

function downloadFile(filename, dataUrl) {
    const element = document.createElement('a');
    element.setAttribute('href', dataUrl);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

let mouseY_splitter, editorHeight_splitter, previewHeight_splitter;
function splitterMouseDownHandler(e) {
    e.preventDefault();
    mouseY_splitter = e.clientY;
    editorHeight_splitter = editorPane.offsetHeight;
    previewHeight_splitter = previewPane.offsetHeight;
    document.addEventListener('mousemove', resizePanesHandler);
    document.addEventListener('mouseup', stopResizeHandler);
    document.body.style.cursor = 'ns-resize';
}
function resizePanesHandler(e) {
    const dy = e.clientY - mouseY_splitter;
    const newEditorHeight = editorHeight_splitter + dy;
    const newPreviewHeight = previewHeight_splitter - dy;
    const minPaneHeight = 80;
    if (newEditorHeight >= minPaneHeight && newPreviewHeight >= minPaneHeight) {
        editorPane.style.height = `${newEditorHeight}px`;
        previewPane.style.height = `${newPreviewHeight}px`;
    }
}
function stopResizeHandler() {
    document.removeEventListener('mousemove', resizePanesHandler);
    document.removeEventListener('mouseup', stopResizeHandler);
    document.body.style.cursor = 'default';
}
function setInitialPaneHeights() {
    if (!contentArea || !splitter || !editorPane || !previewPane) return; // DOM要素がまだない場合は何もしない
    const availableHeight = contentArea.clientHeight - splitter.offsetHeight;
    if (availableHeight <= 0) return;
    const initialEditorHeight = Math.max(80, availableHeight * 0.5);
    const initialPreviewHeight = Math.max(80, availableHeight - initialEditorHeight);
    editorPane.style.height = `${initialEditorHeight}px`;
    previewPane.style.height = `${initialPreviewHeight}px`;
}

function toggleControlsHandler() {
    const isHidden = controlsPanel.classList.toggle('hidden');
    toggleControlsBtn.textContent = isHidden ? '設定を表示する' : '設定を隠す';
    toggleControlsBtn.setAttribute('aria-expanded', String(!isHidden));
    setTimeout(setInitialPaneHeights, 50);
}

// DOMの準備ができた後、さらにライブラリロードなどの非同期処理を開始
window.addEventListener('load', () => {
    // DOM要素をここで取得
    codeInput = document.getElementById('code-input');
    graphOutput = document.getElementById('graph-output');
    notationRadios = document.querySelectorAll('input[name="notation"]');
    templateSelect = document.getElementById('template-select');
    downloadBtn = document.getElementById('download-btn');
    downloadFormatSelect = document.getElementById('download-format');
    editorPane = document.getElementById('editor-pane');
    previewPane = document.getElementById('preview-pane');
    splitter = document.getElementById('splitter');
    contentArea = document.querySelector('.content-area');
    controlsPanel = document.getElementById('controls-panel');
    toggleControlsBtn = document.getElementById('toggle-controls-btn');

    loadLibrariesAndInitialize();
});