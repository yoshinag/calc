// download_utils.js

/**
 * ファイルダウンロードをトリガーする共通関数
 * @param {string} dataUrl - ダウンロードするデータのURL (DataURL or ObjectURL)
 * @param {string} filename - 保存するファイル名
 */
function triggerDownload(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a); // Firefoxで必要になることがある
    a.click();
    document.body.removeChild(a);
    if (dataUrl.startsWith('blob:')) { // ObjectURLの場合、解放する
        URL.revokeObjectURL(dataUrl);
    }
}

/**
 * 現在のグラフをSVGとしてダウンロードする
 * @param {SVGSVGElement} svgElement - ダウンロード対象のSVG要素
 * @param {HTMLElement} graphContainer - グラフのコンテナ要素 (現状は未使用だが、将来的なエラー表示等で利用可能性あり)
 */
async function downloadSVG(svgElement, graphContainer) {
    if (!svgElement) {
        // graphContainer が渡されていれば、それを使ってエラー表示も可能だが、
        // alertがグローバルなので、現状は引数があってもなくても同じ。
        alert('描画されたグラフが見つかりません。(downloadSVG)');
        return;
    }

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    if (!svgString.startsWith('<?xml')) {
        svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'graph.svg');
}

/**
 * 現在のグラフをPNGとしてダウンロードする
 * @param {SVGSVGElement} svgElement - ダウンロード対象のSVG要素
 * @param {HTMLElement} graphContainer - グラフのコンテナ要素 (現状は未使用だが、将来的なエラー表示等で利用可能性あり)
 */
async function downloadPNG(svgElement, graphContainer) {
    if (!svgElement) {
        alert('描画されたグラフが見つかりません。(downloadPNG)');
        return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    // Unicode文字が含まれる場合、btoaで問題が起きるため、エスケープ処理を追加
    const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement('canvas');

        let width = svgElement.width.baseVal.value;
        let height = svgElement.height.baseVal.value;
        const viewBox = svgElement.getAttribute('viewBox');

        if ((width === 0 || height === 0) && viewBox) {
            const parts = viewBox.split(' ');
            width = parseFloat(parts[2]);
            height = parseFloat(parts[3]);
        }
        // Fallback if viewBox also doesn't provide valid dimensions or is absent
        if (width === 0 || height === 0) {
            const bbox = svgElement.getBBox(); // getBBox might be more reliable
            width = bbox.width;
            height = bbox.height;
        }
        // Ultimate fallback if all else fails
        if (width === 0 || height === 0) {
            console.warn("SVG dimensions are zero or invalid, using default 800x600 for PNG.");
            width = 800; height = 600;
        }
        // Ensure positive dimensions
        canvas.width = Math.max(1, width);   // Ensure at least 1px
        canvas.height = Math.max(1, height); // Ensure at least 1px

        const ctx = canvas.getContext('2d');

        // Optional: Fill background for SVGs with transparent background if PNG needs a solid bg
        // ctx.fillStyle = 'white';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
            const pngDataUrl = canvas.toDataURL('image/png');
            triggerDownload(pngDataUrl, 'graph.png');
        } catch (e) {
            console.error("PNG conversion failed:", e);
            alert("PNGへの変換に失敗しました。\nコンソールで詳細を確認してください。\nSVGが複雑すぎるか、セキュリティ制限に抵触している可能性があります。");
        }
    };
    image.onerror = (e) => {
        console.error("Failed to load SVG into image for PNG conversion:", e);
        alert("SVG画像の読み込みに失敗しました。PNG変換できません。");
    };
    image.src = svgDataUrl;
}